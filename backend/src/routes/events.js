const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEvent,
    verifyEvent,
    getComments,
    addComment,
    updateComment,
    deleteComment,
    reportComment,
    toggleHelpfulComment,
    joinChat,
    leaveChat,
    getChatMessages,
    sendMessage,
    reportMessage
} = require('../controllers/eventController');
const { authenticateUser } = require('../middleware/auth');

// Public Incident discovery
router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/:id/comments', getComments);

// Authenticated Community Verification & Discussion
router.post('/:id/verify', authenticateUser, verifyEvent);
router.post('/:id/comments', authenticateUser, addComment);
router.patch('/comments/:commentId', authenticateUser, updateComment);
router.delete('/comments/:commentId', authenticateUser, deleteComment);
router.post('/comments/:commentId/report', authenticateUser, reportComment);
router.post('/comments/:commentId/helpful', authenticateUser, toggleHelpfulComment);

// Authenticated Event Chat
router.post('/:id/join-chat', authenticateUser, joinChat);
router.post('/:id/leave-chat', authenticateUser, leaveChat);
router.get('/:id/chat', authenticateUser, getChatMessages);
router.post('/:id/chat/messages', authenticateUser, sendMessage);
router.post('/chat/messages/:messageId/report', authenticateUser, reportMessage);

module.exports = router;
