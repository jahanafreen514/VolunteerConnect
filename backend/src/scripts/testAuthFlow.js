require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const testAuthFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'volunteerconnect' });
        console.log('1. [PASS] MongoDB Atlas Connected.');

        const testEmail = `test_vol_${Date.now()}@example.com`;
        const testPassword = 'Password123!';
        const newPassword = 'NewPassword456!';

        // Step 1: Register test user
        const user = await User.create({
            name: 'Test Volunteer',
            email: testEmail,
            password: testPassword,
            role: 'volunteer'
        });
        console.log('2. [PASS] User registered successfully in MongoDB Atlas:', user.email);

        // Verify password is NOT stored as plaintext
        const rawUser = await User.findById(user._id).select('+password');
        if (rawUser.password === testPassword || !rawUser.password.startsWith('$2')) {
            throw new Error('FAIL: Password is not properly hashed with bcrypt!');
        }
        console.log('3. [PASS] Password securely hashed with bcrypt in MongoDB.');

        // Step 2: Compare password
        const isMatch = await rawUser.comparePassword(testPassword);
        if (!isMatch) throw new Error('FAIL: Password comparison failed for correct password');
        const isWrongMatch = await rawUser.comparePassword('WrongPass!');
        if (isWrongMatch) throw new Error('FAIL: Password comparison succeeded for wrong password');
        console.log('4. [PASS] Password verification & rejection validated.');

        // Step 3: Forgot password token generation
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        console.log('5. [PASS] Reset password token generated and expiring hash stored in MongoDB.');

        // Verify raw token is NOT in database
        const savedUserWithToken = await User.findById(user._id).select('+resetPasswordToken +resetPasswordExpire');
        if (savedUserWithToken.resetPasswordToken === resetToken) {
            throw new Error('FAIL: Raw reset token was stored in MongoDB without hashing!');
        }
        console.log('6. [PASS] Reset token is securely SHA-256 hashed in MongoDB.');

        // Step 4: Reset password with token
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const userToReset = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!userToReset) throw new Error('FAIL: Could not locate user by reset token');

        userToReset.password = newPassword;
        userToReset.resetPasswordToken = undefined;
        userToReset.resetPasswordExpire = undefined;
        await userToReset.save();
        console.log('7. [PASS] Password successfully reset and reset token invalidated.');

        // Verify old password doesn't work, new password works
        const updatedUser = await User.findById(user._id).select('+password');
        const oldPassWorks = await updatedUser.comparePassword(testPassword);
        const newPassWorks = await updatedUser.comparePassword(newPassword);
        if (oldPassWorks || !newPassWorks) throw new Error('FAIL: Password reset failed to update hash');
        console.log('8. [PASS] New password verified, old password invalidated.');

        // Cleanup test user
        await User.findByIdAndDelete(user._id);
        console.log('9. [PASS] Test user cleaned up. Complete Auth Flow verified 100%!');

        process.exit(0);
    } catch (err) {
        console.error('ERROR during auth flow test:', err);
        process.exit(1);
    }
};

testAuthFlow();
