const express = require('express');
const router = express.Router();
const { getOpportunities, getOpportunity, createOpportunity, updateOpportunity, deleteOpportunity, updateOpportunityStatus, uploadOpportunityImage } = require('../controllers/opportunityController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { uploadOpportunityImage: uploadImage } = require('../middleware/upload');

// Optional auth middleware — attaches user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        const jwt = require('jsonwebtoken');
        try {
            const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
            const User = require('../models/User');
            User.findById(decoded.id).then(user => {
                req.user = user;
                next();
            }).catch(() => next());
        } catch {
            next();
        }
    } else {
        next();
    }
};

router.get('/', optionalAuth, getOpportunities);
router.get('/:id', getOpportunity);

router.use(authenticateUser);
router.use(requireRole('ngo'));

router.post('/', createOpportunity);
router.put('/:id', updateOpportunity);
router.delete('/:id', deleteOpportunity);
router.patch('/:id/status', updateOpportunityStatus);
router.post('/:id/image', uploadImage, uploadOpportunityImage);

module.exports = router;

