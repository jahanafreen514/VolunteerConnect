const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OTP = require('../models/OTP');
const { sendEmail, sendSMS } = require('../services/notificationDeliveryService');
const { success, error } = require('../utils/apiResponse');

const COOLDOWN_SECONDS = 60;
const EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/**
 * Generate and dispatch a secure verification OTP
 */
exports.sendOTP = async (req, res) => {
    try {
        const { identifier, purpose = 'registration', channel = 'email' } = req.body;

        if (!identifier || typeof identifier !== 'string') {
            return error(res, 'A valid email or phone identifier is required', 400);
        }

        const normalizedId = identifier.trim().toLowerCase();

        // Check active cooldown to prevent spam / rate limit
        const existing = await OTP.findOne({ 
            identifier: normalizedId, 
            purpose, 
            verified: false,
            expires_at: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (existing && existing.resend_cooldown && existing.resend_cooldown > new Date()) {
            const remainingSecs = Math.ceil((existing.resend_cooldown.getTime() - Date.now()) / 1000);
            return error(res, `Please wait ${remainingSecs} seconds before requesting a new code.`, 429);
        }

        // Generate cryptographically secure 6-digit numeric code
        const rawOtp = crypto.randomInt(100000, 999999).toString();
        const salt = await bcrypt.genSalt(10);
        const otp_hash = await bcrypt.hash(rawOtp, salt);

        const expires_at = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
        const resend_cooldown = new Date(Date.now() + COOLDOWN_SECONDS * 1000);

        // Delete older unverified codes for this identifier + purpose
        await OTP.deleteMany({ identifier: normalizedId, purpose, verified: false });

        await OTP.create({
            identifier: normalizedId,
            otp_hash,
            purpose,
            channel,
            expires_at,
            max_attempts: MAX_ATTEMPTS,
            resend_cooldown
        });

        // Dispatch via chosen delivery channel
        let deliveryStatus = { success: false, configured: false };
        if (channel === 'sms') {
            deliveryStatus = await sendSMS({
                to: normalizedId,
                message: `Your Virtual Connect verification code is ${rawOtp}. Valid for ${EXPIRY_MINUTES} minutes.`
            });
            if (!deliveryStatus.sent && !deliveryStatus.configured) {
                return error(res, 'SMS delivery provider is not configured on the server.', 503);
            }
        } else {
            const { send_otp_email } = require('../services/emailService');
            deliveryStatus = await send_otp_email({
                to: normalizedId,
                otp: rawOtp,
                purpose,
                expiresInMinutes: EXPIRY_MINUTES
            });

            if (!deliveryStatus.success) {
                if (!deliveryStatus.configured) {
                    return error(res, 'Email delivery service is not configured. Please set SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD) in the server environment.', 503);
                }
                return error(res, deliveryStatus.error || 'Failed to dispatch email verification code. Please check the recipient address.', 500);
            }
        }

        // Mask identifier for response privacy
        const masked = normalizedId.includes('@')
            ? normalizedId.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
            : normalizedId.replace(/\d(?=\d{4})/g, '*');

        return success(res, {
            channel,
            recipient: masked,
            expiresInMinutes: EXPIRY_MINUTES,
            deliveryConfigured: true
        }, `Verification code dispatched to ${masked}`);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * Verify submitted OTP
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { identifier, otp, purpose = 'registration' } = req.body;

        if (!identifier || !otp) {
            return error(res, 'Identifier and verification code are required', 400);
        }

        const normalizedId = identifier.trim().toLowerCase();
        const submittedCode = otp.toString().trim();

        const record = await OTP.findOne({
            identifier: normalizedId,
            purpose,
            verified: false
        }).sort({ createdAt: -1 });

        if (!record) {
            return error(res, 'No active verification code found or code has expired. Please request a new code.', 400);
        }

        // Expiration check
        if (new Date() > record.expires_at) {
            await OTP.deleteOne({ _id: record._id });
            return error(res, 'Verification code has expired. Please request a new code.', 400);
        }

        // Attempt limit check
        if (record.attempts >= record.max_attempts) {
            await OTP.deleteOne({ _id: record._id });
            return error(res, 'Maximum verification attempts exceeded. For security, please request a new code.', 429);
        }

        const isMatch = await bcrypt.compare(submittedCode, record.otp_hash);

        if (!isMatch) {
            record.attempts += 1;
            await record.save();
            const remaining = record.max_attempts - record.attempts;
            return error(res, `Invalid verification code. ${remaining} attempt(s) remaining.`, 400);
        }

        // Mark verified and prevent reuse
        record.verified = true;
        await record.save();

        return success(res, {
            verified: true,
            identifier: normalizedId,
            purpose
        }, 'Verification successful');
    } catch (err) {
        return error(res, err.message, 500);
    }
};
