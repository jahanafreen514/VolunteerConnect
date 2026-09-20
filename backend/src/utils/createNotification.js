const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../services/notificationDeliveryService');

const createNotification = async (userId, title, message, type, relatedId = null, relatedModel = null) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            relatedId,
            relatedModel
        });

        // Try to get io instance for real-time WebSocket delivery
        const io = global.io;
        if (io) {
            io.to(userId.toString()).emit('new_notification', notification);
        }

        // Asynchronously dispatch email notification if user has an email
        User.findById(userId).select('email name').then(recipient => {
            if (recipient && recipient.email) {
                const emailHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; background-color: #0b1120; color: #f8fafc; border-radius: 20px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px; display: flex; align-items: center;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #818cf8;">VolunteerConnect</h2>
                        </div>
                        <h3 style="color: #ffffff; margin-top: 0; font-size: 17px; font-weight: 600;">${title}</h3>
                        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Hello ${recipient.name || 'there'},</p>
                        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; background: rgba(255,255,255,0.04); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">${message}</p>
                        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748b; line-height: 1.5;">
                            This is an automated notification from VolunteerConnect regarding your account activity.
                        </div>
                    </div>
                `;

                sendEmail({
                    to: recipient.email,
                    subject: `[VolunteerConnect] ${title}`,
                    html: emailHtml,
                    text: `${title}\n\nHello ${recipient.name || 'there'},\n\n${message}\n\n- The VolunteerConnect Team`
                }).catch(err => {
                    console.warn('[NotificationService] Email delivery warning:', err.message);
                });
            }
        }).catch(err => {
            console.warn('[NotificationService] User lookup warning:', err.message);
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = createNotification;

