const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    source_type: { 
        type: String, 
        enum: ['ngo', 'news'], 
        default: 'ngo' 
    },
    ngoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: function() { 
            return this.source_type === 'ngo'; 
        } 
    },
    ngoProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGOProfile' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        enum: [
            'environment', 'education', 'health', 'community', 'animals', 'disaster-relief', 'arts', 'sports', 'technology', 'other',
            'Environment', 'Education', 'Healthcare', 'Health', 'Animal Welfare', 'Animals', 'Community Service', 'Community', 'Disaster Relief', 'Arts & Culture', 'Arts', 'Sports', 'Technology', 'Other'
        ],
        default: 'community'
    },
    requiredSkills: [{ type: String }],
    location: {
        address: String,
        city: String,
        state: String,
        country: { type: String, default: 'India' },
        pincode: String,
        formattedAddress: String,
        latitude: Number,
        longitude: Number,
        geo: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0]
            }
        }
    },
    eventDate: { type: Date, default: Date.now },
    startTime: { type: String },
    endTime: { type: String },
    volunteerCapacity: { type: Number, default: 10, min: 1 },
    registeredVolunteers: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'], 
        default: 'published' 
    },
    image: { type: String },

    // Real-World News & Humanitarian Integration fields
    news_event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NewsEvent' },
    source_name: { type: String },
    source_url: { type: String },
    article_title: { type: String },
    reported_at: { type: Date },
    expires_at: { type: Date },
    verification_status: { 
        type: String, 
        enum: ['news_detected', 'needs_verification', 'confirmed', 'rejected'], 
        default: 'confirmed' 
    }
}, { timestamps: true });

opportunitySchema.index({ ngoId: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ category: 1 });
opportunitySchema.index({ eventDate: 1 });
opportunitySchema.index({ source_type: 1 });
opportunitySchema.index({ verification_status: 1 });
opportunitySchema.index({ "location.geo": '2dsphere' });
opportunitySchema.index({ "location.city": 1, "location.state": 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
