const mongoose = require('mongoose');

const ngoProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationName: { type: String, required: true },
    description: { type: String },
    category: { type: String, default: 'Community' },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    pincode: { type: String },
    formattedAddress: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    locationConfirmed: { type: Boolean, default: false },
    registrationNumber: { type: String },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    verificationDocuments: [{ type: String }],
    logo: { type: String }
}, { timestamps: true });

ngoProfileSchema.index({ verificationStatus: 1 });
ngoProfileSchema.index({ location: '2dsphere' });
ngoProfileSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('NGOProfile', ngoProfileSchema);
