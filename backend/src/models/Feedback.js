const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
}, { timestamps: true });

feedbackSchema.index({ volunteerId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
