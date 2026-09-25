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
        enum: [
            'NEWS_DETECTED', 'NEEDS_VERIFICATION', 'COMMUNITY_REPORTED', 'NGO_CONFIRMED', 'ACTIVE', 'RESOLVED', 'EXPIRED',
            'news_detected', 'needs_verification', 'confirmed', 'active', 'expired', 'rejected'
        ],
        default: 'NEEDS_VERIFICATION'
    },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NGOProfile' },
    contact_information: {
        contact_name: { type: String },
        organization_name: { type: String },
        phone: { type: String },
        email: { type: String },
        website: { type: String },
        source_url: { type: String }
    },
    community_verification: {
        confirmed_count: { type: Number, default: 0 },
        unsure_count: { type: Number, default: 0 },
        updates_count: { type: Number, default: 0 },
        helpful_count: { type: Number, default: 0 },
        responses: [{
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            user_name: { type: String },
            response_type: { 
                type: String, 
                enum: ['confirm', 'unsure', 'update', 'helpful'],
                default: 'confirm'
            },
            comment: { type: String },
            created_at: { type: Date, default: Date.now }
        }]
    },
    nearbyNGOs: [{
        ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGOProfile' },
        organizationName: { type: String },
        distanceKm: { type: Number }
    }],
    adoptedOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
    supportRequestsCount: { type: Number, default: 0 }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

newsEventSchema.virtual('description').get(function() {
    return this.summary;
});

newsEventSchema.virtual('category').get(function() {
    return this.event_type;
});

newsEventSchema.index({ "location.geo": '2dsphere' });
newsEventSchema.index({ status: 1 });
newsEventSchema.index({ event_type: 1 });
newsEventSchema.index({ published_at: -1 });
newsEventSchema.index({ expires_at: 1 });
newsEventSchema.index({ "location.city": 1 });

module.exports = mongoose.model('NewsEvent', newsEventSchema);

