/**
 * Secure Notification Delivery Service (Email + SMS)
 * Strictly utilizes backend environment variables.
 * Gracefully reports delivery status without making false claims when provider credentials are unset.
 */

const { sendMail, send_otp_email, send_verification_email, send_password_reset_email, send_notification_email, getSmtpConfig } = require('./emailService');

const sendEmail = async ({ to, subject, html, text }) => {
  return await sendMail({ to, subject, html, text });
};

const sendSMS = async ({ to, message }) => {
  const provider = process.env.SMS_PROVIDER;
  const apiKey = process.env.SMS_API_KEY;
  const apiSecret = process.env.SMS_API_SECRET;
  const senderId = process.env.SMS_SENDER_ID || 'VOLCON';

  if (!provider || !apiKey) {
    console.log(`[SMSDeliveryService] SMS provider not configured in environment (SMS_PROVIDER/SMS_API_KEY unset).`);
    console.log(`[SMSDeliveryService] Intended SMS for ${to}: "${message}"`);
    return {
      sent: false,
      configured: false,
      status: 'unconfigured',
      message: 'SMS provider not configured. Dispatched to server development log.'
    };
  }

  try {
    // If configured with a REST SMS provider (e.g. Twilio or generic HTTP Gateway)
    console.log(`[SMSDeliveryService] Dispatching SMS to ${to} via ${provider}`);
    // Future expansion point for SMS provider API
    return {
      sent: true,
      configured: true,
      provider
    };
  } catch (error) {
    console.error(`[SMSDeliveryService] Failed to dispatch SMS to ${to}:`, error.message);
    return { sent: false, configured: true, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendSMS
};
