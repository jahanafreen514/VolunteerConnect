const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['application_submitted', 'application_accepted', 'application_rejected', 'ngo_verified', 'ngo_rejected', 'new_opportunity', 'certificate_issued', 'event_reminder', 'general'] 
    },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String }
}, { timestamps: true });

notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
