const NewsEvent = require('../models/NewsEvent');
const Comment = require('../models/Comment');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const NGOProfile = require('../models/NGOProfile');
const Opportunity = require('../models/Opportunity');
const { calculateDistance } = require('../services/geocodingService');
const { success, error } = require('../utils/apiResponse');

/**
 * 1. Get All Incidents / News Events with Filters
 */
exports.getEvents = async (req, res) => {
    try {
        const { search, category, city, status, lat, lng, page = 1, limit = 12 } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category.toLowerCase() !== 'all') {
            query.event_type = { $regex: new RegExp(category.trim(), 'i') };
        }

        if (city) {
            query['location.city'] = { $regex: city.trim(), $options: 'i' };
        }

        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        let events = await NewsEvent.find(query)
            .populate('organization_id', 'organizationName logo phone email website verificationStatus')
            .populate('adoptedOpportunityId', 'title status eventDate volunteerCapacity registeredVolunteers')
            .sort({ published_at: -1 })
            .skip(skip)
            .limit(parseInt(limit, 10));

        const total = await NewsEvent.countDocuments(query);

        let formatted = events.map(e => {
            const obj = e.toObject ? e.toObject() : { ...e };
            if (lat && lng && obj.location?.latitude && obj.location?.longitude) {
                obj.distanceKm = calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    obj.location.latitude,
                    obj.location.longitude
                );
            }
            return obj;
        });

        if (lat && lng) {
            formatted.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
        }

        return success(res, {
            events: formatted,
            total,
            page: parseInt(page, 10),
            totalPages: Math.ceil(total / parseInt(limit, 10))
        }, 'Events retrieved successfully');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 2. Get Single Incident Detail
 */
exports.getEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await NewsEvent.findById(id)
            .populate('organization_id', 'organizationName logo phone email website address city state verificationStatus')
            .populate('adoptedOpportunityId')
            .populate('nearbyNGOs.ngoId', 'organizationName logo phone email website verificationStatus');

        if (!event) {
            return error(res, 'Incident not found', 404);
        }

        const obj = event.toObject ? event.toObject() : { ...event };

        // Determine if an organization is officially linked or adopted
        let verifiedOrg = null;
        if (event.organization_id) {
            verifiedOrg = event.organization_id;
        } else if (event.adoptedOpportunityId && event.adoptedOpportunityId.ngoProfileId) {
            const ngo = await NGOProfile.findById(event.adoptedOpportunityId.ngoProfileId);
            if (ngo) verifiedOrg = ngo;
        } else if (event.nearbyNGOs && event.nearbyNGOs.length > 0) {
            // Suggest the closest registered NGO if available
            verifiedOrg = {
                organizationName: event.nearbyNGOs[0].organizationName,
                distanceKm: event.nearbyNGOs[0].distanceKm,
                status: 'Nearby Registered NGO'
            };
        }

        obj.identifiedOrganization = verifiedOrg;

        // Ensure default community verification structure
        if (!obj.community_verification) {
            obj.community_verification = {
                confirmed_count: 0,
                unsure_count: 0,
                updates_count: 0,
                helpful_count: 0,
                responses: []
            };
        }

        return success(res, obj, 'Incident detail retrieved successfully');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 3. Community Verification ("Is this true? / Still current?")
 */
exports.verifyEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { response_type = 'confirm', comment = '' } = req.body;
        const userId = req.user.id;
        const userName = req.user.name;

        const event = await NewsEvent.findById(id);
        if (!event) {
            return error(res, 'Incident not found', 404);
        }

        if (!event.community_verification) {
            event.community_verification = {
                confirmed_count: 0,
                unsure_count: 0,
                updates_count: 0,
                helpful_count: 0,
                responses: []
            };
        }

        // Check if user has already responded
        const existingIdx = event.community_verification.responses.findIndex(
            r => r.user_id && r.user_id.toString() === userId
        );

        if (existingIdx !== -1) {
            // Update previous response
            event.community_verification.responses[existingIdx].response_type = response_type;
            if (comment) event.community_verification.responses[existingIdx].comment = comment;
            event.community_verification.responses[existingIdx].created_at = new Date();
        } else {
            // Push new response
            event.community_verification.responses.push({
                user_id: userId,
                user_name: userName,
                response_type,
                comment: comment || undefined,
                created_at: new Date()
            });
        }

        // Recalculate tallies
        let confirmed = 0;
        let unsure = 0;
        let updates = 0;
        let helpful = 0;

        for (const resp of event.community_verification.responses) {
            if (resp.response_type === 'confirm') confirmed++;
            else if (resp.response_type === 'unsure') unsure++;
            else if (resp.response_type === 'update') updates++;
            else if (resp.response_type === 'helpful') helpful++;
        }

        event.community_verification.confirmed_count = confirmed;
        event.community_verification.unsure_count = unsure;
        event.community_verification.updates_count = updates;
        event.community_verification.helpful_count = helpful;

        // If status was strictly news_detected/needs_verification, advance to community_reported
        if (['NEWS_DETECTED', 'NEEDS_VERIFICATION', 'news_detected', 'needs_verification'].includes(event.status)) {
            event.status = 'COMMUNITY_REPORTED';
        }

        await event.save();

        return success(res, {
            community_verification: event.community_verification,
            status: event.status
        }, 'Community report recorded successfully');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 4. Get Comments (Threaded)
 */
exports.getComments = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch all comments for this event
        const comments = await Comment.find({ event_id: id })
            .sort({ created_at: 1 })
            .populate('user_id', 'name role profileImage');

        // Build threaded structure: top-level comments and replies
        const topLevel = [];
        const replyMap = {};

        comments.forEach(c => {
            const commentObj = c.toObject();
            if (c.is_deleted) {
                commentObj.content = '[This comment has been removed by the user or moderator]';
            }
            commentObj.replies = [];

            if (!c.parent_comment_id) {
                topLevel.push(commentObj);
            } else {
                const parentId = c.parent_comment_id.toString();
                if (!replyMap[parentId]) {
                    replyMap[parentId] = [];
                }
                replyMap[parentId].push(commentObj);
            }
        });

        // Attach replies to top-level comments (or their immediate parents)
        const attachReplies = (list) => {
            list.forEach(item => {
                if (replyMap[item._id.toString()]) {
                    item.replies = replyMap[item._id.toString()];
                    attachReplies(item.replies);
                }
            });
        };

        attachReplies(topLevel);

        // Sort top-level in reverse chronological order
        topLevel.reverse();

        return success(res, topLevel, 'Comments retrieved successfully');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 5. Add Comment or Reply
 */
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, parent_comment_id } = req.body;

        if (!content || !content.trim()) {
            return error(res, 'Comment content cannot be empty', 400);
        }

        const event = await NewsEvent.findById(id);
        if (!event) {
            return error(res, 'Incident not found', 404);
        }

        let parentComment = null;
        if (parent_comment_id) {
            parentComment = await Comment.findById(parent_comment_id);
            if (!parentComment) {
                return error(res, 'Parent comment not found', 404);
            }
        }

        const comment = await Comment.create({
            event_id: event._id,
            user_id: req.user.id,
            user_name: req.user.name,
            user_profile_image: req.user.profileImage || '',
            user_role: req.user.role || 'volunteer',
            parent_comment_id: parent_comment_id || null,
            content: content.trim()
        });

        // Notify parent comment author if reply
        if (parentComment && parentComment.user_id.toString() !== req.user.id) {
            const notif = await Notification.create({
                userId: parentComment.user_id,
                title: 'Comment Reply',
                message: `${req.user.name} replied to your comment on: ${event.title.slice(0, 50)}`,
                type: 'comment_reply',
                relatedId: event._id,
                relatedModel: 'NewsEvent'
            });

            if (global.io) {
                global.io.to(parentComment.user_id.toString()).emit('new_notification', notif);
            }
        }

        // Broadcast to event room
        if (global.io) {
            global.io.to(`event_${event._id}`).emit('new_event_comment', comment);
        }

        return success(res, comment, 'Comment posted successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 6. Update Own Comment
 */
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return error(res, 'Comment content cannot be empty', 400);
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return error(res, 'Comment not found', 404);
        }

        if (comment.user_id.toString() !== req.user.id) {
            return error(res, 'Not authorized to edit this comment', 403);
        }

        if (comment.is_deleted) {
            return error(res, 'Cannot edit a deleted comment', 400);
        }

        comment.content = content.trim();
        comment.updated_at = new Date();
        await comment.save();

        return success(res, comment, 'Comment updated successfully');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 7. Delete Own Comment (Soft Delete)
 */
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return error(res, 'Comment not found', 404);
        }

        const isOwner = comment.user_id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return error(res, 'Not authorized to delete this comment', 403);
        }

        comment.is_deleted = true;
        comment.content = '[This comment has been removed]';
        await comment.save();

        return success(res, null, 'Comment deleted successfully');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 8. Report Comment
 */
exports.reportComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reason = 'Inappropriate content' } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return error(res, 'Comment not found', 404);
        }

        comment.is_reported = true;
        comment.report_count = (comment.report_count || 0) + 1;
        comment.reported_by.push({
            user_id: req.user.id,
            reason,
            created_at: new Date()
        });

        await comment.save();

        return success(res, null, 'Comment reported for community moderation');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 9. Toggle Helpful on Comment
 */
exports.toggleHelpfulComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return error(res, 'Comment not found', 404);
        }

        const idx = comment.helpful_users.findIndex(u => u.toString() === userId);
        let userHasHelped = false;

        if (idx !== -1) {
            comment.helpful_users.splice(idx, 1);
            comment.helpful_count = Math.max(0, (comment.helpful_count || 0) - 1);
        } else {
            comment.helpful_users.push(userId);
            comment.helpful_count = (comment.helpful_count || 0) + 1;
            userHasHelped = true;
        }

        await comment.save();

        return success(res, {
            helpful_count: comment.helpful_count,
            hasHelped: userHasHelped
        }, userHasHelped ? 'Marked as helpful' : 'Removed helpful mark');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 10. Join Event-Based Discussion / Chat
 */
exports.joinChat = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const event = await NewsEvent.findById(id);
        if (!event) {
            return error(res, 'Incident not found', 404);
        }

        let conversation = await Conversation.findOne({ event_id: event._id });
        if (!conversation) {
            conversation = await Conversation.create({
                event_id: event._id,
                title: `Incident: ${event.title}`,
                participants: [userId]
            });
        } else if (!conversation.participants.includes(userId)) {
            conversation.participants.push(userId);
            await conversation.save();
        }

        return success(res, conversation, 'Joined incident discussion');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 11. Leave Event Chat
 */
exports.leaveChat = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const conversation = await Conversation.findOne({ event_id: id });
        if (conversation) {
            conversation.participants = conversation.participants.filter(
                p => p.toString() !== userId
            );
            await conversation.save();
        }

        return success(res, null, 'Left incident discussion');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 12. Get Chat Messages for Event
 */
exports.getChatMessages = async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await Conversation.findOne({ event_id: id });
        if (!conversation) {
            return success(res, { conversation: null, messages: [] }, 'No active chat yet');
        }

        const messages = await Message.find({ conversation_id: conversation._id })
            .sort({ created_at: 1 })
            .limit(100);

        return success(res, {
            conversation,
            messages
        }, 'Chat messages retrieved successfully');
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 13. Send Message to Event Conversation
 */
exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return error(res, 'Message content cannot be empty', 400);
        }

        const event = await NewsEvent.findById(id);
        if (!event) {
            return error(res, 'Incident not found', 404);
        }

        let conversation = await Conversation.findOne({ event_id: event._id });
        if (!conversation) {
            conversation = await Conversation.create({
                event_id: event._id,
                title: `Incident: ${event.title}`,
                participants: [req.user.id]
            });
        } else if (!conversation.participants.includes(req.user.id)) {
            conversation.participants.push(req.user.id);
            await conversation.save();
        }

        const message = await Message.create({
            conversation_id: conversation._id,
            event_id: event._id,
            sender_id: req.user.id,
            sender_name: req.user.name,
            sender_role: req.user.role || 'volunteer',
            content: content.trim()
        });

        // Broadcast to real-time Socket.io room
        if (global.io) {
            global.io.to(`event_${event._id}`).emit('new_event_message', message);
        }

        return success(res, message, 'Message sent successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * 14. Report Chat Message
 */
exports.reportMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { reason = 'Inappropriate content' } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return error(res, 'Message not found', 404);
        }

        message.is_reported = true;
        message.report_count = (message.report_count || 0) + 1;
        message.reported_by.push({
            user_id: req.user.id,
            reason,
            created_at: new Date()
        });

        await message.save();

        return success(res, null, 'Message reported for moderation');
    } catch (err) {
        return error(res, err.message, 500);
    }
};
