const express = require('express');
const router = express.Router();
const { getMyCertificates, getCertificate, generateCertificate } = require('../controllers/certificateController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/my', requireRole('volunteer'), getMyCertificates);
router.get('/:id', getCertificate);
router.post('/', requireRole('ngo'), generateCertificate);

module.exports = router;
