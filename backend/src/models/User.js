const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['volunteer', 'ngo', 'admin'], default: 'volunteer' },
    phone: { type: String },
    profileImage: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    interests: [{ type: String }],
    availability: { type: String, default: 'Weekends' },
    location: {
        address: String,
        city: String,
        state: String,
        country: { type: String, default: 'India' },
        pincode: String,
        formatted_address: String,
        latitude: Number,
        longitude: Number
    },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const crypto = require('crypto');
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expiration to 1 hour
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
