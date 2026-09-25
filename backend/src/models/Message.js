const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation', 
        required: true 
    },
    event_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'NewsEvent', 
        required: true 
    },
    sender_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sender_name: { 
        type: String, 
        required: true 
    },
    sender_role: { 
        type: String, 
        enum: ['volunteer', 'ngo', 'admin'], 
        default: 'volunteer' 
    },
    content: { 
        type: String, 
        required: true,
        trim: true 
    },
    read_by: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
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
    is_deleted: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

messageSchema.index({ conversation_id: 1, created_at: 1 });
messageSchema.index({ event_id: 1 });

module.exports = mongoose.model('Message', messageSchema);
