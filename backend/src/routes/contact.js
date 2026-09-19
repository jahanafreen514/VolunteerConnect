const express = require('express');
const router = express.Router();
const { submitContactMessage, getContactMessages } = require('../controllers/contactController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/', [
    check('name', 'Name is required').not().isEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('subject', 'Subject is required').not().isEmpty().trim(),
    check('message', 'Message must be at least 10 characters').isLength({ min: 10 }).trim()
], validate, submitContactMessage);

router.get('/', authenticateUser, requireRole('admin'), getContactMessages);

module.exports = router;
