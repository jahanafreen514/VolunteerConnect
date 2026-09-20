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
        let deliveryStatus = { sent: false, configured: false };
        if (channel === 'sms') {
            deliveryStatus = await sendSMS({
                to: normalizedId,
                message: `Your VolunteerConnect verification code is ${rawOtp}. Valid for ${EXPIRY_MINUTES} minutes.`
            });
        } else {
            deliveryStatus = await sendEmail({
                to: normalizedId,
                subject: `Your VolunteerConnect Verification Code: ${rawOtp}`,
                text: `Your VolunteerConnect verification code is ${rawOtp}. It will expire in ${EXPIRY_MINUTES} minutes. Do not share this code with anyone.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 16px;">
                        <h2 style="color: #4f46e5; margin-bottom: 12px;">VolunteerConnect Verification</h2>
                        <p style="color: #475569; font-size: 14px; line-height: 1.5;">Use the verification code below to complete your authentication process:</p>
                        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e293b;">${rawOtp}</span>
                        </div>
                        <p style="color: #94a3b8; font-size: 12px;">This code will expire in ${EXPIRY_MINUTES} minutes. If you did not request this, you can safely ignore this email.</p>
                    </div>
                `
            });
        }

        // Mask identifier for response privacy
        const masked = normalizedId.includes('@')
            ? normalizedId.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
            : normalizedId.replace(/\d(?=\d{4})/g, '*');

        return success(res, {
            channel,
            recipient: masked,
            expiresInMinutes: EXPIRY_MINUTES,
            deliveryConfigured: deliveryStatus.configured
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
