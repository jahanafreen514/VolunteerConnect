const User = require('../models/User');
const NGOProfile = require('../models/NGOProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Report = require('../models/Report');
const { success, error } = require('../utils/apiResponse');
const createNotification = require('../utils/createNotification');

exports.getDashboardStats = async (req, res) => {
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const pendingVerifications = await NGOProfile.countDocuments({ verificationStatus: 'pending' });
    const activeOpportunities = await Opportunity.countDocuments({ status: { $in: ['published', 'ongoing'] } });
    const totalApplications = await Application.countDocuments();
    const completedEvents = await Opportunity.countDocuments({ status: 'completed' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    return success(res, {
        totalVolunteers,
        totalNGOs,
        pendingVerifications,
        activeOpportunities,
        totalApplications,
        completedEvents,
        pendingReports
    }, 'Dashboard stats retrieved');
};

exports.getNGOs = async (req, res) => {
    const { page = 1, limit = 10, verificationStatus } = req.query;
    let query = {};
    if (verificationStatus) query.verificationStatus = verificationStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const ngos = await NGOProfile.find(query)
        .populate('userId', 'name email isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await NGOProfile.countDocuments(query);

    return success(res, {
        ngos,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'NGOs retrieved');
};

exports.verifyNGO = async (req, res) => {
    // Accept 'action' (frontend sends this) or 'status' as the verification decision
    const rawAction = req.body.action || req.body.status;
    const { rejectionReason } = req.body;

    // Map 'approve' -> 'approved', 'reject' -> 'rejected'
    const status = rawAction === 'approve' ? 'approved' : rawAction === 'reject' ? 'rejected' : rawAction;

    if (!['approved', 'rejected'].includes(status)) {
        return error(res, 'Invalid action. Use approve or reject', 400);
    }

    const ngoProfile = await NGOProfile.findById(req.params.id);
    if (!ngoProfile) {
        return error(res, 'NGO Profile not found', 404);
    }

    ngoProfile.verificationStatus = status;
    if (status === 'rejected' && rejectionReason) {
        ngoProfile.rejectionReason = rejectionReason;
    }
    await ngoProfile.save();

    await createNotification(
        ngoProfile.userId,
        `Profile Verification ${status}`,
        `Your NGO profile verification has been ${status}. ${status === 'rejected' ? `Reason: ${rejectionReason}` : ''}`,
        status === 'approved' ? 'ngo_verified' : 'ngo_rejected',
        ngoProfile._id,
        'NGOProfile'
    );

    return success(res, ngoProfile, `NGO profile ${status}`);
};

exports.getUsers = async (req, res) => {
    const { page = 1, limit = 10, search, role } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return success(res, {
        users,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'Users retrieved');
};

exports.toggleUserActive = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return error(res, 'User not found', 404);
    }
    
    if (user.role === 'admin') {
        return error(res, 'Cannot modify admin users', 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return success(res, user, `User account ${user.isActive ? 'activated' : 'deactivated'}`);
};

exports.getOpportunities = async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const opportunities = await Opportunity.find(query)
        .populate('ngoId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Opportunity.countDocuments(query);

    return success(res, {
        opportunities,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'Opportunities retrieved');
};

exports.getReports = async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reports = await Report.find(query)
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    return success(res, {
        reports,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'Reports retrieved');
};

exports.updateReport = async (req, res) => {
    const { status, adminNote } = req.body;
    
    const report = await Report.findByIdAndUpdate(
        req.params.id,
        { status, adminNote },
        { new: true, runValidators: true }
    );

    if (!report) {
        return error(res, 'Report not found', 404);
    }

    return success(res, report, 'Report updated');
};

exports.getAnalytics = async (req, res) => {
    // Basic implementations for charts
    const opportunitiesByCategory = await Opportunity.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const applicationsByMonth = await Application.aggregate([
        { $match: { appliedAt: { $gte: sixMonthsAgo } } },
        { $group: {
            _id: { month: { $month: '$appliedAt' }, year: { $year: '$appliedAt' } },
            count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const volunteerGrowthByMonth = await User.aggregate([
        { $match: { role: 'volunteer', createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const ngoGrowthByMonth = await User.aggregate([
        { $match: { role: 'ngo', createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topNGOs = await Opportunity.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$ngoId', completedCount: { $sum: 1 } } },
        { $sort: { completedCount: -1 } },
        { $limit: 5 }
    ]);

    // Populate topNGOs
    const populatedTopNGOs = await User.populate(topNGOs, { path: '_id', select: 'name' });

    return success(res, {
        opportunitiesByCategory,
        applicationsByMonth,
        volunteerGrowthByMonth,
        ngoGrowthByMonth,
        topNGOs: populatedTopNGOs.map(n => ({ name: n._id?.name, count: n.completedCount }))
    }, 'Analytics retrieved');
};
