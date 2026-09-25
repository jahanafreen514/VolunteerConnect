/**
 * Robust Email Delivery Service using Nodemailer
 * Supports standard SMTP environment variables:
 * SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_FROM_NAME, SMTP_USE_TLS
 * 
 * Includes clean HTML templates with Virtual Connect branding and security advisories.
 * Explicitly verifies configuration and refuses to simulate false success in production.
 */

const nodemailer = require('nodemailer');

const getSmtpConfig = () => {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
    const user = process.env.SMTP_USERNAME || process.env.SMTP_USER || process.env.EMAIL_USERNAME;
    const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.FROM_EMAIL || process.env.EMAIL_FROM || user || 'no-reply@volunteerconnect.org';
    const fromName = process.env.SMTP_FROM_NAME || process.env.FROM_NAME || 'Virtual Connect';
    const useTLS = process.env.SMTP_USE_TLS === 'true' || port === 465;

    const isConfigured = Boolean(host && user && pass);

    return {
        host,
        port,
        user,
        pass,
        from: `"${fromName}" <${fromEmail}>`,
        fromEmail,
        fromName,
        useTLS,
        isConfigured
    };
};

let cachedTransporter = null;

const getTransporter = () => {
    const config = getSmtpConfig();
    if (!config.isConfigured) {
        return null;
    }

    if (!cachedTransporter) {
        cachedTransporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.useTLS,
            auth: {
                user: config.user,
                pass: config.pass
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000
        });
    }

    return cachedTransporter;
};

/**
 * Base email dispatcher
 */
const sendMail = async ({ to, subject, html, text }) => {
    const config = getSmtpConfig();

    if (!to || !to.includes('@')) {
        return {
            success: false,
            configured: config.isConfigured,
            error: 'A valid recipient email address is required.'
        };
    }

    if (!config.isConfigured) {
        // Strict reporting: SMTP is not configured
        console.warn(`[EmailService] Notice: SMTP credentials not set. Email to <${to}> cannot be delivered.`);
        return {
            success: false,
            configured: false,
            error: 'SMTP email credentials are not configured on the server. Please set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, and SMTP_PASSWORD.'
        };
    }

    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail({
            from: config.from,
            to,
            subject,
            text,
            html
        });

        console.log(`[EmailService] Email dispatched successfully to ${to}. Message ID: ${info.messageId}`);
        return {
            success: true,
            configured: true,
            messageId: info.messageId
        };
    } catch (err) {
        console.error(`[EmailService] Failed to send email to ${to}:`, err.message);
        return {
            success: false,
            configured: true,
            error: `Email delivery failed: ${err.message}`
        };
    }
};

/**
 * Common Header and Footer for HTML emails
 */
const wrapTemplate = (contentHtml, titleText = 'Virtual Connect Notification') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titleText}</title>
</head>
<body style="margin:0; padding:0; background-color:#050816; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050816; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px; background-color:#0b112c; border:1px solid rgba(255,255,255,0.1); border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          <!-- Brand Header -->
          <tr>
            <td style="padding:28px 32px; background:linear-gradient(135deg, rgba(79,70,229,0.2), rgba(147,51,234,0.15)); border-bottom:1px solid rgba(255,255,255,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:20px; font-weight:800; letter-spacing:-0.5px; background:linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip:text; color:#818cf8;">
                      Virtual Connect
                    </span>
                    <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8; letter-spacing:0.5px; text-transform:uppercase;">
                      Community & Volunteer Network
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px; background-color:#070b1e; border-top:1px solid rgba(255,255,255,0.06); text-align:center;">
              <p style="margin:0 0 8px 0; font-size:12px; color:#64748b; line-height:1.5;">
                This is an automated security transmission from Virtual Connect.<br />
                If you did not initiate this request, no action is required.
              </p>
              <p style="margin:0; font-size:11px; color:#475569;">
                &copy; ${new Date().getFullYear()} Virtual Connect Platform. Connecting communities & humanitarian relief.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * 1. Send OTP Email for Account Verification or Registration
 */
const send_otp_email = async ({ to, otp, purpose = 'registration', expiresInMinutes = 10 }) => {
    const purposeTitleMap = {
        registration: 'Account Verification',
        password_reset: 'Password Reset',
        account_verification: 'Email Verification',
        sensitive_action: 'Security Authorization'
    };

    const purposeTitle = purposeTitleMap[purpose] || 'Security Verification';

    const html = wrapTemplate(`
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#ffffff;">
            ${purposeTitle} Code
        </h1>
        <p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#cbd5e1;">
            Use the 6-digit one-time code below to complete your ${purpose.replace('_', ' ')} on Virtual Connect:
        </p>

        <div style="background-color:rgba(99,102,241,0.08); border:2px dashed #6366f1; border-radius:16px; padding:24px 16px; text-align:center; margin:0 0 24px 0;">
            <div style="font-size:36px; font-weight:800; letter-spacing:10px; color:#a5b4fc; font-family:monospace; margin-left:10px;">
                ${otp}
            </div>
            <p style="margin:8px 0 0 0; font-size:12px; font-weight:600; color:#818cf8; text-transform:uppercase; letter-spacing:1px;">
                Expires in ${expiresInMinutes} minutes
            </p>
        </div>

        <div style="padding:16px; background-color:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:12px; margin-bottom:16px;">
            <p style="margin:0; font-size:12px; color:#fca5a5; line-height:1.5;">
                <strong>Security Advisory:</strong> Never share this one-time code with anyone. Virtual Connect team members will never ask for your code.
            </p>
        </div>
    `, `${purposeTitle} - Virtual Connect`);

    const text = `Your Virtual Connect verification code is ${otp}. Valid for ${expiresInMinutes} minutes. Do not share this code with anyone.`;

    return await sendMail({
        to,
        subject: `Your Virtual Connect Verification Code: ${otp}`,
        html,
        text
    });
};

/**
 * 2. Send Welcome / Verification Email
 */
const send_verification_email = async ({ to, name = 'Community Member', verificationUrl, otp }) => {
    const html = wrapTemplate(`
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#ffffff;">
            Welcome to Virtual Connect, ${name}!
        </h1>
        <p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#cbd5e1;">
            Thank you for joining our mission to empower local volunteering, emergency disaster coordination, and community civic actions.
        </p>
        ${otp ? `
        <div style="background-color:rgba(99,102,241,0.08); border:2px dashed #6366f1; border-radius:16px; padding:20px; text-align:center; margin:20px 0;">
            <div style="font-size:32px; font-weight:800; letter-spacing:8px; color:#a5b4fc; font-family:monospace;">
                ${otp}
            </div>
            <p style="margin:6px 0 0 0; font-size:12px; color:#94a3b8;">Use this code to verify your account</p>
        </div>` : ''}
        ${verificationUrl ? `
        <div style="text-align:center; margin:28px 0;">
            <a href="${verificationUrl}" style="display:inline-block; padding:14px 32px; background:linear-gradient(135deg, #4f46e5, #7c3aed); color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; border-radius:12px; box-shadow:0 8px 20px rgba(79,70,229,0.35);">
                Confirm Email Address
            </a>
        </div>` : ''}
    `, 'Welcome to Virtual Connect');

    const text = `Welcome to Virtual Connect, ${name}! Please verify your account using the provided instructions.`;

    return await sendMail({
        to,
        subject: 'Welcome to Virtual Connect — Confirm Your Account',
        html,
        text
    });
};

/**
 * 3. Send Password Reset Email
 */
const send_password_reset_email = async ({ to, name = 'User', resetUrl, otp }) => {
    const html = wrapTemplate(`
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#ffffff;">
            Password Reset Request
        </h1>
        <p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#cbd5e1;">
            Hello ${name}, a request has been made to reset the password for your Virtual Connect account.
        </p>

        ${resetUrl ? `
        <div style="text-align:center; margin:28px 0;">
            <a href="${resetUrl}" style="display:inline-block; padding:14px 32px; background:linear-gradient(135deg, #4f46e5, #7c3aed); color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; border-radius:12px; box-shadow:0 8px 20px rgba(79,70,229,0.35);">
                Reset Password
            </a>
        </div>
        <p style="margin:0 0 16px 0; font-size:12px; color:#94a3b8; word-break:break-all;">
            Or copy and paste this URL into your browser: <br />
            <a href="${resetUrl}" style="color:#818cf8;">${resetUrl}</a>
        </p>` : ''}

        ${otp ? `
        <div style="background-color:rgba(99,102,241,0.08); border:2px dashed #6366f1; border-radius:16px; padding:20px; text-align:center; margin:20px 0;">
            <div style="font-size:32px; font-weight:800; letter-spacing:8px; color:#a5b4fc; font-family:monospace;">
                ${otp}
            </div>
            <p style="margin:6px 0 0 0; font-size:12px; color:#94a3b8;">Enter this code to set a new password</p>
        </div>` : ''}

        <p style="margin:20px 0 0 0; font-size:12px; color:#64748b; line-height:1.5;">
            This link/code is valid for 60 minutes. If you did not request a password reset, please ignore this message and ensure your account remains secure.
        </p>
    `, 'Password Reset - Virtual Connect');

    const text = `You requested a password reset for Virtual Connect. Reset link: ${resetUrl || otp}`;

    return await sendMail({
        to,
        subject: 'Virtual Connect — Password Reset Request',
        html,
        text
    });
};

/**
 * 4. Send Notification Email (for comment replies, chat alerts, application updates)
 */
const send_notification_email = async ({ to, name = 'User', title, message, actionUrl }) => {
    const html = wrapTemplate(`
        <h1 style="margin:0 0 16px 0; font-size:20px; font-weight:700; color:#ffffff;">
            ${title}
        </h1>
        <p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#cbd5e1;">
            Hello ${name},
        </p>
        <div style="padding:18px; background-color:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:14px; margin-bottom:24px;">
            <p style="margin:0; font-size:14px; color:#e2e8f0; line-height:1.6; white-space:pre-wrap;">${message}</p>
        </div>
        ${actionUrl ? `
        <div style="text-align:center; margin:24px 0;">
            <a href="${actionUrl}" style="display:inline-block; padding:12px 28px; background:linear-gradient(135deg, #4f46e5, #7c3aed); color:#ffffff; font-size:13px; font-weight:600; text-decoration:none; border-radius:10px;">
                View on Virtual Connect
            </a>
        </div>` : ''}
    `, title);

    return await sendMail({
        to,
        subject: `Virtual Connect: ${title}`,
        html,
        text: `${title}\n\n${message}\n\n${actionUrl ? `View: ${actionUrl}` : ''}`
    });
};

module.exports = {
    getSmtpConfig,
    sendMail,
    send_otp_email,
    send_verification_email,
    send_password_reset_email,
    send_notification_email
};
