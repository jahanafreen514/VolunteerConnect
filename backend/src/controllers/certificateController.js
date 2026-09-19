const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Opportunity = require('../models/Opportunity');
const { success, error } = require('../utils/apiResponse');
const generateCertificateNumber = require('../utils/generateCertificateNumber');
const createNotification = require('../utils/createNotification');

exports.getMyCertificates = async (req, res) => {
    const certificates = await Certificate.find({ volunteerId: req.user.id })
        .populate('opportunityId', 'title eventDate')
        .populate('ngoId', 'name');

    return success(res, certificates, 'Certificates retrieved');
};

exports.getCertificate = async (req, res) => {
    const certificate = await Certificate.findById(req.params.id)
        .populate('volunteerId', 'name email profileImage')
        .populate('opportunityId', 'title eventDate description')
        .populate('ngoId', 'name');

    if (!certificate) {
        return error(res, 'Certificate not found', 404);
    }

    return success(res, certificate, 'Certificate retrieved');
};

exports.generateCertificate = async (req, res) => {
    const { volunteerId, opportunityId, hours } = req.body;

    const opportunity = await Opportunity.findOne({ _id: opportunityId, ngoId: req.user.id });
    if (!opportunity) {
        return error(res, 'Opportunity not found or unauthorized', 404);
    }

    const attendance = await Attendance.findOne({ volunteerId, opportunityId, status: 'present' });
    if (!attendance) {
        return error(res, 'Volunteer must have present attendance to receive a certificate', 400);
    }

    let certificate = await Certificate.findOne({ volunteerId, opportunityId });
    if (certificate) {
        return error(res, 'Certificate already exists for this volunteer and opportunity', 400);
    }

    certificate = await Certificate.create({
        volunteerId,
        opportunityId,
        ngoId: req.user.id,
        certificateNumber: generateCertificateNumber(),
        hours: hours || 0
    });

    await createNotification(
        volunteerId,
        'Certificate Issued',
        `You have received a certificate for ${opportunity.title}.`,
        'certificate_issued',
        certificate._id,
        'Certificate'
    );

    return success(res, certificate, 'Certificate generated successfully', 201);
};
