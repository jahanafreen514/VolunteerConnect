const Report = require('../models/Report');
const { success, error } = require('../utils/apiResponse');

exports.createReport = async (req, res) => {
    const { targetId, targetModel, reason, description } = req.body;

    const report = await Report.create({
        reportedBy: req.user.id,
        targetId,
        targetModel,
        reason,
        description
    });

    return success(res, report, 'Report submitted successfully', 201);
};

exports.getMyReports = async (req, res) => {
    const reports = await Report.find({ reportedBy: req.user.id })
        .sort({ createdAt: -1 });

    return success(res, reports, 'Reports retrieved');
};
