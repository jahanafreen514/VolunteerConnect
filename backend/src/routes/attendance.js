const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/', requireRole('ngo'), markAttendance);
router.post('/:id', requireRole('ngo'), markAttendance);
router.put('/:id', requireRole('ngo'), markAttendance);
router.get('/:opportunityId', requireRole('ngo'), getAttendance);
router.get('/my/history', requireRole('volunteer'), getMyAttendance);

module.exports = router;
