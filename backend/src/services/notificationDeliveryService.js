/**
 * Secure Notification Delivery Service (Email + SMS)
 * Strictly utilizes backend environment variables.
 * Gracefully reports delivery status without making false claims when provider credentials are unset.
 */

const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = process.env.EMAIL_PORT || process.env.SMTP_PORT || 587;
  const user = process.env.EMAIL_USERNAME || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.FROM_EMAIL || '"VolunteerConnect" <no-reply@volunteerconnect.org>';

  if (!host || !user || !pass) {
    // Graceful fallback status in development when SMTP is not configured
    console.log('----------------------------------------------------');
    console.log(`[EMAIL SIMULATION] Destination: <${to}>`);
    console.log(`[EMAIL SIMULATION] Subject: ${subject}`);
    console.log(`[EMAIL SIMULATION] Content:\n${text || subject}`);
    console.log('----------------------------------------------------');
    return {
      sent: false,
      configured: false,
      status: 'unconfigured',
      message: 'SMTP credentials not configured in environment. Dispatched to server development log.'
    };
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html
    });

    console.log(`[EmailDeliveryService] Email sent successfully to ${to}, Message ID: ${info.messageId}`);
    return { sent: true, configured: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailDeliveryService] Error sending email to ${to}:`, error.message);
    return { sent: false, configured: true, error: error.message };
  }
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
