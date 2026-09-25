const crypto = require('crypto');
const User = require('../models/User');
const NGOProfile = require('../models/NGOProfile');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/apiResponse');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

exports.register = async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
        return error(res, 'User already exists with this email', 400);
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || undefined,
        role: role || 'volunteer'
    });

    if (user.role === 'ngo') {
        await NGOProfile.create({
            userId: user._id,
            organizationName: req.body.organizationName || name,
            email: user.email,
            phone: phone || undefined
        });
    }

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

    return success(res, { token, user: userData }, 'User registered successfully', 201);
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        return error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
        return error(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

    return success(res, { token, user: userData }, 'Login successful', 200);
};

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return error(res, 'User not found', 404);
    }
    return success(res, user, 'User profile fetched successfully');
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return error(res, 'Please provide an email address', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return error(res, 'No account found with this email address', 404);
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Determine client URL
    const clientUrl = (process.env.CLIENT_URL || 'https://volunteer-connect-omega-ten.vercel.app')
        .split(',')[0]
        .trim()
        .replace(/\/$/, '');
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because a password reset request was submitted for your VolunteerConnect account.\n\nPlease click the link below to choose a new password:\n\n${resetUrl}\n\nThis link will expire in 60 minutes. If you did not request this, you can safely ignore this email.`;

    const { send_password_reset_email } = require('../services/emailService');
    const emailResult = await send_password_reset_email({
        to: user.email,
        name: user.name,
        resetUrl
    });

    if (!emailResult.success) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        if (!emailResult.configured) {
            return error(res, 'Email delivery is currently not configured on the server. Please set SMTP credentials.', 503);
        }
        return error(res, emailResult.error || 'Email could not be delivered. Please verify your address or try again later.', 500);
    }

    return success(res, null, 'Password reset instructions sent to your email');
};

exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 6) {
        return error(res, 'Password must be at least 6 characters', 400);
    }

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return error(res, 'Invalid or expired password reset token', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

    return success(res, { token, user: userData }, 'Password has been successfully reset');
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return error(res, 'Please provide both current and new password', 400);
    }
    if (newPassword.length < 6) {
        return error(res, 'New password must be at least 6 characters', 400);
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return error(res, 'User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return error(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    return success(res, null, 'Password updated successfully');
};

exports.logout = async (req, res) => {
    res.clearCookie('token');
    return success(res, null, 'Logged out successfully');
};
