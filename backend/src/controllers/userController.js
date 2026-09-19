const User = require('../models/User');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const { success, error } = require('../utils/apiResponse');

exports.getProfile = async (req, res) => {
    return success(res, req.user, 'Profile retrieved successfully');
};

exports.updateProfile = async (req, res) => {
    const { name, phone, bio, skills, interests, location } = req.body;
    
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone, bio, skills, interests, location },
        { new: true, runValidators: true }
    );

    return success(res, user, 'Profile updated successfully');
};

exports.uploadProfileImage = async (req, res) => {
    if (!req.file) {
        return error(res, 'Please upload an image', 400);
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { profileImage: req.file.path },
        { new: true }
    );

    return success(res, user, 'Profile image updated successfully');
};

exports.getVolunteerStats = async (req, res) => {
    const applications = await Application.find({ volunteerId: req.user.id });
    const certificates = await Certificate.find({ volunteerId: req.user.id });

    const now = new Date();
    // Get accepted applications with upcoming events
    const acceptedAppIds = applications.filter(a => a.status === 'accepted').map(a => a.opportunityId);
    const upcomingOpps = await require('../models/Opportunity').find({
        _id: { $in: acceptedAppIds },
        eventDate: { $gte: now }
    });

    const stats = {
        upcomingCount: upcomingOpps.length,
        pendingCount: applications.filter(a => a.status === 'pending').length,
        acceptedCount: applications.filter(a => a.status === 'accepted').length,
        completedCount: applications.filter(a => a.status === 'completed').length,
        certificateCount: certificates.length,
        totalHours: certificates.reduce((sum, cert) => sum + (cert.hours || 0), 0),
        // Also include old names for backward compat
        totalApplications: applications.length,
        totalCertificates: certificates.length,
    };

    return success(res, stats, 'Stats retrieved successfully');
};

exports.getUpcomingEvents = async (req, res) => {
    const applications = await Application.find({ 
        volunteerId: req.user.id,
        status: 'accepted'
    }).populate({
        path: 'opportunityId',
        match: { eventDate: { $gte: new Date() } }
    });

    // Filter out applications where opportunity didn't match
    const upcoming = applications.filter(app => app.opportunityId !== null);
    return success(res, upcoming, 'Upcoming events retrieved successfully');
};

exports.getParticipationHistory = async (req, res) => {
    const applications = await Application.find({ 
        volunteerId: req.user.id,
        status: 'completed'
    }).populate('opportunityId');

    const attendances = await Attendance.find({ 
        volunteerId: req.user.id,
        status: 'present'
    });

    return success(res, { applications, attendances }, 'History retrieved successfully');
};
