const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    certificateNumber: { type: String, required: true, unique: true },
    issuedDate: { type: Date, default: Date.now },
    hours: { type: Number }
}, { timestamps: true });

certificateSchema.index({ volunteerId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
