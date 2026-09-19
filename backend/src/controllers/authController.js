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
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
        return error(res, 'User already exists with this email', 400);
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'volunteer'
    });

    if (user.role === 'ngo') {
        await NGOProfile.create({
            userId: user._id,
            organizationName: req.body.organizationName || name,
            email: user.email
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

    try {
        await sendEmail({
            email: user.email,
            subject: 'VolunteerConnect - Password Reset Request',
            message,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #111827; color: #ffffff; border-radius: 8px;">
                  <h2 style="color: #6366f1;">VolunteerConnect Password Reset</h2>
                  <p>You requested a password reset for your account. Click the button below to choose a new password:</p>
                  <div style="margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                  </div>
                  <p style="color: #9ca3af; font-size: 14px;">This link will expire in 60 minutes. If you did not make this request, you can safely ignore this email.</p>
                </div>
            `
        });

        return success(res, { resetUrl }, 'Password reset link sent to your email');
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return error(res, 'Email could not be sent. Please try again later', 500);
    }
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
