const express = require('express');
const router = express.Router();
const { submitFeedback, getOpportunityFeedback, getMyFeedback } = require('../controllers/feedbackController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/', requireRole('volunteer'), submitFeedback);
router.get('/my', requireRole('volunteer'), getMyFeedback);
router.get('/opportunity/:id', getOpportunityFeedback); // NGO or Admin can access

module.exports = router;
