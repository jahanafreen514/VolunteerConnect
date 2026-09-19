const NGOProfile = require('../models/NGOProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const { success, error } = require('../utils/apiResponse');

exports.createProfile = async (req, res) => {
    let profile = await NGOProfile.findOne({ userId: req.user.id });
    if (profile) {
        return error(res, 'Profile already exists', 400);
    }

    profile = await NGOProfile.create({
        ...req.body,
        userId: req.user.id
    });

    return success(res, profile, 'Profile created successfully', 201);
};

exports.updateProfile = async (req, res) => {
    let profile = await NGOProfile.findOne({ userId: req.user.id });
    if (!profile) {
        return error(res, 'Profile not found', 404);
    }

    profile = await NGOProfile.findByIdAndUpdate(profile._id, req.body, { new: true, runValidators: true });
    return success(res, profile, 'Profile updated successfully');
};

exports.getMyProfile = async (req, res) => {
    const profile = await NGOProfile.findOne({ userId: req.user.id }).populate('userId', 'name email profileImage');
    // Return null data (not 404) so frontend can show create-profile flow
    return success(res, profile || null, profile ? 'Profile retrieved' : 'No profile found');
};

exports.uploadDocuments = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return error(res, 'Please upload documents', 400);
    }

    const urls = req.files.map(file => file.path);
    const profile = await NGOProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { verificationDocuments: { $each: urls } } },
        { new: true }
    );

    return success(res, profile, 'Documents uploaded successfully');
};

exports.uploadLogo = async (req, res) => {
    if (!req.file) {
        return error(res, 'Please upload a logo', 400);
    }

    const profile = await NGOProfile.findOneAndUpdate(
        { userId: req.user.id },
        { logo: req.file.path },
        { new: true }
    );

    return success(res, profile, 'Logo uploaded successfully');
};

exports.getNGOStats = async (req, res) => {
    const opportunities = await Opportunity.find({ ngoId: req.user.id });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({ opportunityId: { $in: oppIds } });

    const stats = {
        totalOpportunities: opportunities.length,
        activeOpportunities: opportunities.filter(o => o.status === 'published' || o.status === 'ongoing').length,
        completedOpportunities: opportunities.filter(o => o.status === 'completed').length,
        totalApplicationsReceived: applications.length,
        acceptedVolunteers: applications.filter(a => a.status === 'accepted').length
    };

    return success(res, stats, 'Stats retrieved');
};

exports.getPublicNGOProfile = async (req, res) => {
    const profile = await NGOProfile.findOne({ userId: req.params.userId }).populate('userId', 'name profileImage');
    if (!profile) {
        return error(res, 'NGO Profile not found', 404);
    }
    return success(res, profile, 'Profile retrieved');
};
