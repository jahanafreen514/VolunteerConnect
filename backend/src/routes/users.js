const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfileImage, getVolunteerStats, getUpcomingEvents, getParticipationHistory } = require('../controllers/userController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { uploadProfileImage: uploadImage } = require('../middleware/upload');

router.use(authenticateUser);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/image', uploadImage, uploadProfileImage);

router.get('/stats', requireRole('volunteer'), getVolunteerStats);
router.get('/upcoming', requireRole('volunteer'), getUpcomingEvents);
router.get('/history', requireRole('volunteer'), getParticipationHistory);

module.exports = router;
