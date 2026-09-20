const mongoose = require('mongoose');

const newsEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String, required: true },
    source_name: { type: String, required: true },
    source_url: { type: String, required: true },
    article_title: { type: String },
    published_at: { type: Date, default: Date.now },
    retrieved_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true },
    event_type: { 
        type: String, 
        enum: ['flood', 'cyclone', 'earthquake', 'fire', 'food_distribution', 'blood_donation', 'tree_plantation', 'cleanup', 'community_campaign', 'other'],
        default: 'community_campaign'
    },
    location: {
        address: { type: String },
        city: { type: String, required: true },
        state: { type: String },
        country: { type: String, default: 'India' },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        geo: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    potential_activities: [{ type: String }],
    status: { 
        type: String, 
        enum: ['news_detected', 'needs_verification', 'confirmed', 'active', 'expired', 'rejected'],
        default: 'needs_verification'
    },
    nearbyNGOs: [{
        ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGOProfile' },
        organizationName: { type: String },
        distanceKm: { type: Number }
    }],
    adoptedOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
    supportRequestsCount: { type: Number, default: 0 }
}, { timestamps: true });

newsEventSchema.index({ "location.geo": '2dsphere' });
newsEventSchema.index({ status: 1 });
newsEventSchema.index({ event_type: 1 });
newsEventSchema.index({ expires_at: 1 });
newsEventSchema.index({ "location.city": 1 });

module.exports = mongoose.model('NewsEvent', newsEventSchema);
