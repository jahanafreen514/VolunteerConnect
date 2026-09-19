const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetModel: { type: String, enum: ['User', 'NGOProfile', 'Opportunity'], required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
    adminNote: { type: String }
}, { timestamps: true });

reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
