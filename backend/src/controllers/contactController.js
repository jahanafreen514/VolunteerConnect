const ContactMessage = require('../models/ContactMessage');
const { success, error } = require('../utils/apiResponse');

exports.submitContactMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return error(res, 'Please provide all required fields: name, email, subject, message', 400);
    }

    const contactEntry = await ContactMessage.create({
        name,
        email: email.toLowerCase(),
        subject,
        message,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    });

    return success(res, contactEntry, 'Thank you for reaching out! Your message has been received.', 201);
};

exports.getContactMessages = async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(query);

    return success(res, {
        messages,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'Contact messages retrieved');
};
