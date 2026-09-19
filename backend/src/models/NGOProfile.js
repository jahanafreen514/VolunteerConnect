const mongoose = require('mongoose');

const ngoProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationName: { type: String, required: true },
    description: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    registrationNumber: { type: String },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    verificationDocuments: [{ type: String }],
    logo: { type: String }
}, { timestamps: true });

ngoProfileSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('NGOProfile', ngoProfileSchema);
