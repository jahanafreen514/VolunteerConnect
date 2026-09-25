const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    event_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'NewsEvent', 
        required: true,
        unique: true
    },
    title: { 
        type: String, 
        trim: true 
    },
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    is_active: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Conversation', conversationSchema);
