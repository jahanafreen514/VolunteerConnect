const Attendance = require('../models/Attendance');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');
const { success, error } = require('../utils/apiResponse');
const createNotification = require('../utils/createNotification');
const generateCertificateNumber = require('../utils/generateCertificateNumber');

exports.markAttendance = async (req, res) => {
    let { opportunityId, volunteerId, status, checkInTime, checkOutTime, attendanceId } = req.body;
    const targetId = req.params.id || attendanceId;

    let attendance = null;
    let application = null;
    let opportunity = null;

    if (targetId) {
        attendance = await Attendance.findById(targetId);
        if (attendance) {
            opportunityId = attendance.opportunityId;
            volunteerId = attendance.volunteerId;
        } else {
            application = await Application.findById(targetId);
            if (application) {
                opportunityId = application.opportunityId;
                volunteerId = application.volunteerId;
            }
        }
    }

    if (!opportunityId || !volunteerId) {
        return error(res, 'Opportunity ID and Volunteer ID are required', 400);
    }

    opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
        return error(res, 'Opportunity not found', 404);
    }

    if (opportunity.ngoId.toString() !== req.user.id) {
        return error(res, 'Unauthorized', 403);
    }

    if (!application) {
        application = await Application.findOne({ opportunityId, volunteerId, status: { $in: ['accepted', 'completed'] } });
    }

    if (!attendance) {
        attendance = await Attendance.findOne({ opportunityId, volunteerId });
    }

    if (attendance) {
        if (status) attendance.status = status;
        if (checkInTime !== undefined) attendance.checkInTime = checkInTime;
        if (checkOutTime !== undefined) attendance.checkOutTime = checkOutTime;
        attendance.markedBy = req.user.id;
        await attendance.save();
    } else {
        attendance = await Attendance.create({
            opportunityId,
            volunteerId,
            applicationId: application ? application._id : null,
            status: status || 'present',
            checkInTime: checkInTime || '',
            checkOutTime: checkOutTime || '',
            markedBy: req.user.id
        });
    }

    // Auto-generate certificate if present and completed
    if (status === 'present' && opportunity.status === 'completed') {
        const existingCert = await Certificate.findOne({ volunteerId, opportunityId });
        if (!existingCert) {
            let hours = 0;
            if (attendance.checkInTime && attendance.checkOutTime) {
                hours = Math.round((new Date(attendance.checkOutTime) - new Date(attendance.checkInTime)) / (1000 * 60 * 60));
            }

            const cert = await Certificate.create({
                volunteerId,
                opportunityId,
                ngoId: opportunity.ngoId,
                certificateNumber: generateCertificateNumber(),
                hours
            });

            await createNotification(
                volunteerId,
                'Certificate Issued',
                `You have received a certificate for ${opportunity.title}.`,
                'certificate_issued',
                cert._id,
                'Certificate'
            );
        }
    }

    return success(res, attendance, 'Attendance marked successfully');
};

exports.getAttendance = async (req, res) => {
    const opportunity = await Opportunity.findOne({ _id: req.params.opportunityId, ngoId: req.user.id });
    if (!opportunity) {
        return error(res, 'Opportunity not found or unauthorized', 404);
    }

    // Get all accepted applications for this opportunity
    const acceptedApplications = await Application.find({
        opportunityId: req.params.opportunityId,
        status: { $in: ['accepted', 'completed'] }
    }).populate('volunteerId', 'name email profileImage');

    // Get existing attendance records
    const attendanceRecords = await Attendance.find({ opportunityId: req.params.opportunityId });

    // Merge: for each accepted application, attach attendance record if exists
    const result = acceptedApplications.map(app => {
        const att = attendanceRecords.find(a => a.volunteerId.toString() === app.volunteerId._id.toString());
        return {
            _id: att ? att._id : app._id,
            user: app.volunteerId,
            volunteer: app.volunteerId,
            applicationId: app._id,
            opportunityId: req.params.opportunityId,
            status: att ? att.status : 'pending',
            checkInTime: att ? att.checkInTime : '',
            checkOutTime: att ? att.checkOutTime : '',
            applicationStatus: app.status,
            attendance: att || null
        };
    });

    return success(res, result, 'Attendance retrieved');
};

exports.getMyAttendance = async (req, res) => {
    const attendance = await Attendance.find({ volunteerId: req.user.id })
        .populate('opportunityId', 'title eventDate location');

    return success(res, attendance, 'Attendance history retrieved');
};

