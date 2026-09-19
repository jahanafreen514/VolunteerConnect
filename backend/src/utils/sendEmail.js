const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If SMTP host and credentials are provided, send actual email
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const message = {
            from: `${process.env.FROM_NAME || 'VolunteerConnect'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`
        };

        const info = await transporter.sendMail(message);
        console.log(`Email sent: ${info.messageId}`);
        return { sent: true, messageId: info.messageId };
    } else {
        // Graceful fallback for environments where SMTP credentials are not yet set
        console.log('====================================================');
        console.log(`[EMAIL SIMULATION] To: ${options.email}`);
        console.log(`[EMAIL SIMULATION] Subject: ${options.subject}`);
        console.log(`[EMAIL SIMULATION] Body:\n${options.message}`);
        console.log('====================================================');
        return { sent: false, simulated: true };
    }
};

module.exports = sendEmail;
