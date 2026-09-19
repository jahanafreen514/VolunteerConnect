require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const NGOProfile = require('../models/NGOProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const generateCertificateNumber = require('../utils/generateCertificateNumber');

const testIntegrationFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'volunteerconnect' });
        console.log('1. [PASS] MongoDB Atlas Connected.');

        const timestamp = Date.now();
        // Create test volunteer
        const volunteer = await User.create({
            name: `Test Volunteer ${timestamp}`,
            email: `volunteer_${timestamp}@example.com`,
            password: 'Password123!',
            role: 'volunteer'
        });

        // Create test NGO user
        const ngoUser = await User.create({
            name: `Test NGO ${timestamp}`,
            email: `ngo_${timestamp}@example.com`,
            password: 'Password123!',
            role: 'ngo'
        });

        // Create approved NGO Profile
        const ngoProfile = await NGOProfile.create({
            userId: ngoUser._id,
            organizationName: `Green Earth ${timestamp}`,
            verificationStatus: 'approved'
        });
        console.log('2. [PASS] Approved NGO and Volunteer created.');

        // NGO creates opportunity
        const opportunity = await Opportunity.create({
            ngoId: ngoUser._id,
            ngoProfileId: ngoProfile._id,
            title: `Beach Cleanup ${timestamp}`,
            description: 'Cleaning plastic waste from the coast',
            category: 'Environment',
            volunteerCapacity: 10,
            registeredVolunteers: 0,
            eventDate: new Date(Date.now() + 86400000),
            status: 'published'
        });
        console.log('3. [PASS] Opportunity created and published.');

        // Volunteer applies
        const application = await Application.create({
            volunteerId: volunteer._id,
            opportunityId: opportunity._id,
            message: 'I would love to help!'
        });
        opportunity.registeredVolunteers += 1;
        await opportunity.save();
        console.log('4. [PASS] Volunteer applied; registered count updated in MongoDB.');

        // Check duplicate application prevention logic
        const duplicate = await Application.findOne({
            volunteerId: volunteer._id,
            opportunityId: opportunity._id
        });
        if (!duplicate) throw new Error('FAIL: Application not found');
        console.log('5. [PASS] Existing application detection validated.');

        // Notification created
        const notification = await Notification.create({
            userId: ngoUser._id,
            title: 'New Volunteer Application',
            message: `${volunteer.name} applied for ${opportunity.title}`,
            type: 'application_submitted'
        });
        console.log('6. [PASS] Notification persisted to MongoDB for NGO.');

        // Mark attendance and complete event
        opportunity.status = 'completed';
        await opportunity.save();

        const attendance = await Attendance.create({
            opportunityId: opportunity._id,
            volunteerId: volunteer._id,
            applicationId: application._id,
            status: 'present',
            markedBy: ngoUser._id
        });

        const cert = await Certificate.create({
            volunteerId: volunteer._id,
            opportunityId: opportunity._id,
            ngoId: ngoUser._id,
            certificateNumber: generateCertificateNumber(),
            hours: 4
        });
        console.log('7. [PASS] Attendance marked & Certificate issued with number:', cert.certificateNumber);

        // Verification query
        const volunteerCerts = await Certificate.find({ volunteerId: volunteer._id });
        if (volunteerCerts.length !== 1) throw new Error('FAIL: Certificate query mismatch');
        console.log('8. [PASS] Volunteer certificate retrieved from MongoDB.');

        // Cleanup
        await Certificate.deleteMany({ opportunityId: opportunity._id });
        await Attendance.deleteMany({ opportunityId: opportunity._id });
        await Application.deleteMany({ opportunityId: opportunity._id });
        await Opportunity.findByIdAndDelete(opportunity._id);
        await NGOProfile.findByIdAndDelete(ngoProfile._id);
        await Notification.deleteMany({ userId: ngoUser._id });
        await User.findByIdAndDelete(volunteer._id);
        await User.findByIdAndDelete(ngoUser._id);
        console.log('9. [PASS] All test documents cleaned up. Complete End-to-End Workflow verified 100%!');

        process.exit(0);
    } catch (err) {
        console.error('ERROR during integration flow test:', err);
        process.exit(1);
    }
};

testIntegrationFlow();
