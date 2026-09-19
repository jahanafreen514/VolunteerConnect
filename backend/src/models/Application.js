const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'], 
        default: 'pending' 
    },
    message: { type: String },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

applicationSchema.index({ volunteerId: 1, opportunityId: 1 }, { unique: true });
applicationSchema.index({ volunteerId: 1 });
applicationSchema.index({ opportunityId: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
