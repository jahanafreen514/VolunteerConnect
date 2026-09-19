const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/apiResponse');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return error(res, 'User already exists', 400);
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'volunteer'
    });

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

    return success(res, { token, user: userData }, 'User registered successfully', 201);
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return error(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return error(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
        return error(res, 'Your account has been deactivated', 403);
    }

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

    return success(res, { token, user: userData }, 'Login successful', 200);
};

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    return success(res, user, 'User profile fetched successfully');
};
