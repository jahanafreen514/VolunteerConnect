const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getMe, 
    logout, 
    forgotPassword, 
    resetPassword, 
    changePassword 
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validate, register);

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], validate, login);

router.post('/logout', logout);

router.get('/me', authenticateUser, getMe);

router.post('/forgot-password', [
    check('email', 'Please include a valid email').isEmail()
], validate, forgotPassword);

router.post('/reset-password/:token', [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validate, resetPassword);

router.post('/change-password', [
    authenticateUser,
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], validate, changePassword);

module.exports = router;
