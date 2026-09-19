const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ngoProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGOProfile' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['environment', 'education', 'health', 'community', 'animals', 'disaster-relief', 'arts', 'sports', 'technology', 'other'] 
    },
    requiredSkills: [{ type: String }],
    location: {
        address: String,
        city: String,
        state: String,
        country: String
    },
    eventDate: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    volunteerCapacity: { type: Number, required: true, min: 1 },
    registeredVolunteers: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'], 
        default: 'draft' 
    },
    image: { type: String }
}, { timestamps: true });

opportunitySchema.index({ ngoId: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ category: 1 });
opportunitySchema.index({ eventDate: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
