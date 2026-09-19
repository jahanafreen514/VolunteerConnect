const express = require('express');
const router = express.Router();
const { getDashboardStats, getNGOs, verifyNGO, getUsers, toggleUserActive, getOpportunities, getReports, updateReport, getAnalytics } = require('../controllers/adminController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);
router.use(requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/ngos', getNGOs);
router.patch('/ngos/:id/verify', verifyNGO);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserActive);
router.get('/opportunities', getOpportunities);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReport);
router.get('/analytics', getAnalytics);

module.exports = router;
