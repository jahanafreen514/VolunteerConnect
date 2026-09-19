const express = require('express');
const router = express.Router();
const { applyForOpportunity, getMyApplications, cancelApplication, getOpportunityApplications, reviewApplication, getAllApplications, getNGOApplications } = require('../controllers/applicationController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/', requireRole('volunteer'), applyForOpportunity);
router.get('/my', requireRole('volunteer'), getMyApplications);
router.delete('/:id', requireRole('volunteer'), cancelApplication);

router.get('/ngo', requireRole('ngo'), getNGOApplications);
router.get('/opportunity/:opportunityId', requireRole('ngo'), getOpportunityApplications);
router.patch('/:id/review', requireRole('ngo'), reviewApplication);

router.get('/', requireRole('admin'), getAllApplications);

module.exports = router;
