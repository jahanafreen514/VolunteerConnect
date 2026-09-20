const express = require('express');
const router = express.Router();
const { 
  createProfile, 
  updateProfile, 
  getMyProfile, 
  uploadDocuments, 
  uploadLogo, 
  getNGOStats, 
  getPublicNGOProfile,
  getActiveVolunteers,
  getSuggestedVolunteers
} = require('../controllers/ngoController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { uploadNGODocuments, uploadNGOLogo } = require('../middleware/upload');

router.get('/public/:userId', getPublicNGOProfile);

router.use(authenticateUser);
router.use(requireRole('ngo'));

router.post('/profile', createProfile);
router.put('/profile', updateProfile);
router.get('/profile', getMyProfile);
router.post('/profile/documents', uploadNGODocuments, uploadDocuments);
router.post('/profile/logo', uploadNGOLogo, uploadLogo);
router.get('/stats', getNGOStats);
router.get('/active-volunteers', getActiveVolunteers);
router.get('/suggested-volunteers', getSuggestedVolunteers);

module.exports = router;
