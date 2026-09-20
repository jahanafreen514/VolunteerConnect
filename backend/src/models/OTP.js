const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    identifier: { 
        type: String, 
        required: true, 
        index: true,
        trim: true,
        lowercase: true 
    },
    otp_hash: { 
        type: String, 
        required: true 
    },
    purpose: { 
        type: String, 
        enum: ['registration', 'password_reset', 'account_verification', 'sensitive_action'], 
        default: 'registration' 
    },
    channel: { 
        type: String, 
        enum: ['email', 'sms'], 
        default: 'email' 
    },
    expires_at: { 
        type: Date, 
        required: true,
        index: { expires: 0 } // MongoDB TTL automatic cleanup
    },
    attempts: { 
        type: Number, 
        default: 0 
    },
    max_attempts: { 
        type: Number, 
        default: 5 
    },
    verified: { 
        type: Boolean, 
        default: false 
    },
    resend_cooldown: { 
        type: Date 
    }
}, { timestamps: true });

otpSchema.index({ identifier: 1, purpose: 1 });

module.exports = mongoose.model('OTP', otpSchema);
