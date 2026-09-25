const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    event_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'NewsEvent', 
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    user_name: { 
        type: String, 
        required: true 
    },
    user_profile_image: { 
        type: String, 
        default: '' 
    },
    user_role: { 
        type: String, 
        enum: ['volunteer', 'ngo', 'admin'], 
        default: 'volunteer' 
    },
    parent_comment_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment', 
        default: null
    },
    content: { 
        type: String, 
        required: true,
        trim: true 
    },
    is_deleted: { 
        type: Boolean, 
        default: false 
    },
    is_reported: { 
        type: Boolean, 
        default: false 
    },
    report_count: { 
        type: Number, 
        default: 0 
    },
    reported_by: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, default: 'Inappropriate content' },
        created_at: { type: Date, default: Date.now }
    }],
    helpful_count: { 
        type: Number, 
        default: 0 
    },
    helpful_users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

commentSchema.index({ event_id: 1, created_at: -1 });
commentSchema.index({ parent_comment_id: 1, created_at: 1 });

module.exports = mongoose.model('Comment', commentSchema);
