const express = require('express');
const router = express.Router();
const { createReport, getMyReports } = require('../controllers/reportController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/', createReport);
router.get('/my', getMyReports);

module.exports = router;
