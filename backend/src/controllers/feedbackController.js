const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const Opportunity = require('../models/Opportunity');
const { success, error } = require('../utils/apiResponse');

exports.submitFeedback = async (req, res) => {
    const { opportunityId, rating, comment } = req.body;

    const attendance = await Attendance.findOne({ 
        opportunityId, 
        volunteerId: req.user.id,
        status: 'present'
    });

    if (!attendance) {
        return error(res, 'You must have attended the event to submit feedback', 400);
    }

    const existingFeedback = await Feedback.findOne({ opportunityId, volunteerId: req.user.id });
    if (existingFeedback) {
        return error(res, 'Feedback already submitted for this opportunity', 400);
    }

    const opportunity = await Opportunity.findById(opportunityId);

    const feedback = await Feedback.create({
        volunteerId: req.user.id,
        opportunityId,
        ngoId: opportunity.ngoId,
        rating,
        comment
    });

    return success(res, feedback, 'Feedback submitted successfully', 201);
};

exports.getOpportunityFeedback = async (req, res) => {
    const feedback = await Feedback.find({ opportunityId: req.params.id })
        .populate('volunteerId', 'name profileImage')
        .sort({ createdAt: -1 });

    return success(res, feedback, 'Feedback retrieved');
};

exports.getMyFeedback = async (req, res) => {
    const feedback = await Feedback.find({ volunteerId: req.user.id })
        .populate('opportunityId', 'title')
        .sort({ createdAt: -1 });

    return success(res, feedback, 'Feedback history retrieved');
};
