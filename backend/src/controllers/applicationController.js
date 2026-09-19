const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const { success, error } = require('../utils/apiResponse');
const createNotification = require('../utils/createNotification');

exports.applyForOpportunity = async (req, res) => {
    const { opportunityId, message } = req.body;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
        return error(res, 'Opportunity not found', 404);
    }

    if (opportunity.status !== 'published') {
        return error(res, 'Opportunity is not available for applications', 400);
    }

    if (opportunity.registeredVolunteers >= opportunity.volunteerCapacity) {
        return error(res, 'Opportunity has reached maximum capacity', 400);
    }

    const existingApplication = await Application.findOne({
        volunteerId: req.user.id,
        opportunityId
    });

    if (existingApplication) {
        return error(res, 'You have already applied for this opportunity', 400);
    }

    const application = await Application.create({
        volunteerId: req.user.id,
        opportunityId,
        message
    });

    opportunity.registeredVolunteers += 1;
    await opportunity.save();

    await createNotification(
        opportunity.ngoId,
        'New Application',
        `${req.user.name} has applied for ${opportunity.title}`,
        'application_submitted',
        application._id,
        'Application'
    );

    return success(res, application, 'Application submitted successfully', 201);
};

exports.getMyApplications = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find({ volunteerId: req.user.id })
        .populate({
            path: 'opportunityId',
            populate: { path: 'ngoId', select: 'name' }
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Application.countDocuments({ volunteerId: req.user.id });

    return success(res, {
        applications,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'Applications retrieved successfully');
};

exports.cancelApplication = async (req, res) => {
    const application = await Application.findOne({ _id: req.params.id, volunteerId: req.user.id });
    if (!application) {
        return error(res, 'Application not found', 404);
    }

    if (application.status !== 'pending') {
        return error(res, 'Can only cancel pending applications', 400);
    }

    application.status = 'cancelled';
    await application.save();

    const opportunity = await Opportunity.findById(application.opportunityId);
    if (opportunity) {
        opportunity.registeredVolunteers = Math.max(0, opportunity.registeredVolunteers - 1);
        await opportunity.save();
    }

    return success(res, application, 'Application cancelled successfully');
};

exports.getOpportunityApplications = async (req, res) => {
    const opportunity = await Opportunity.findOne({ _id: req.params.opportunityId, ngoId: req.user.id });
    if (!opportunity) {
        return error(res, 'Opportunity not found or unauthorized', 404);
    }

    const applications = await Application.find({ opportunityId: req.params.opportunityId })
        .populate('volunteerId', 'name email phone profileImage skills');

    return success(res, applications, 'Applications retrieved successfully');
};

exports.reviewApplication = async (req, res) => {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
        return error(res, 'Invalid status', 400);
    }

    const application = await Application.findById(req.params.id).populate('opportunityId');
    if (!application) {
        return error(res, 'Application not found', 404);
    }

    if (application.opportunityId.ngoId.toString() !== req.user.id) {
        return error(res, 'Unauthorized', 403);
    }

    if (application.status !== 'pending') {
        return error(res, 'Application is already reviewed', 400);
    }

    if (status === 'accepted') {
        const acceptedCount = await Application.countDocuments({
            opportunityId: application.opportunityId._id,
            status: 'accepted'
        });

        if (acceptedCount >= application.opportunityId.volunteerCapacity) {
            return error(res, 'Capacity full', 400);
        }
    }

    application.status = status;
    application.reviewedAt = Date.now();
    application.reviewedBy = req.user.id;
    await application.save();

    await createNotification(
        application.volunteerId,
        `Application ${status}`,
        `Your application for ${application.opportunityId.title} has been ${status}.`,
        status === 'accepted' ? 'application_accepted' : 'application_rejected',
        application.opportunityId._id,
        'Opportunity'
    );

    return success(res, application, `Application ${status} successfully`);
};

exports.getAllApplications = async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const applications = await Application.find(query)
        .populate('volunteerId', 'name email')
        .populate('opportunityId', 'title ngoId')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    return success(res, {
        applications,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'All applications retrieved');
};

exports.getNGOApplications = async (req, res) => {
    const { page = 1, limit = 50, status, opportunityId } = req.query;
    let query = {};
    
    if (opportunityId) {
        const opp = await Opportunity.findOne({ _id: opportunityId, ngoId: req.user.id });
        if (!opp) {
            return error(res, 'Opportunity not found or unauthorized', 404);
        }
        query.opportunityId = opportunityId;
    } else {
        const ngoOpps = await Opportunity.find({ ngoId: req.user.id }).select('_id');
        const oppIds = ngoOpps.map(o => o._id);
        query.opportunityId = { $in: oppIds };
    }

    if (status && status !== 'all') {
        query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const applications = await Application.find(query)
        .populate('volunteerId', 'name email phone profileImage skills')
        .populate('opportunityId', 'title eventDate location')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    return success(res, {
        applications,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'NGO applications retrieved');
};

