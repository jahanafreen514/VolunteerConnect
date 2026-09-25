const express = require('express');
const router = express.Router();
const {
  geocode,
  reverse,
  getNearby,
  getNewsEvents,
  refreshNews,
  adoptNewsEvent,
  rejectNewsEvent,
  requestSupport
} = require('../controllers/locationController');
const { authenticateUser, requireRole } = require('../middleware/auth');

// Public location & discovery endpoints
router.post('/geocode', geocode);
router.post('/reverse-geocode', reverse);
router.get('/nearby', authenticateUser, getNearby);
router.get('/news-events', getNewsEvents);
router.post('/refresh-news', refreshNews);
router.post('/request-support/:id', requestSupport);

// Authenticated NGO endpoints to adopt or reject a news event
router.post('/adopt-event/:id', authenticateUser, requireRole('ngo'), adoptNewsEvent);
router.post('/reject-event/:id', authenticateUser, requireRole('ngo'), rejectNewsEvent);

module.exports = router;
