const NGOProfile = require('../models/NGOProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const { success, error } = require('../utils/apiResponse');
const { geocodeAddress } = require('../services/geocodingService');

const enrichNGOLocation = async (body) => {
    const data = { ...body };
    let lat = data.latitude ? parseFloat(data.latitude) : null;
    let lng = data.longitude ? parseFloat(data.longitude) : null;

    const addressStr = typeof data.address === 'object' 
        ? (data.address.street || data.address.address || '') 
        : (data.address || '');
    const cityStr = typeof data.address === 'object' 
        ? (data.address.city || data.city || '') 
        : (data.city || '');
    const stateStr = typeof data.address === 'object' 
        ? (data.address.state || data.state || '') 
        : (data.state || '');
    const countryStr = typeof data.address === 'object' 
        ? (data.address.country || data.country || 'India') 
        : (data.country || 'India');
    const pincodeStr = typeof data.address === 'object' 
        ? (data.address.postalCode || data.address.pincode || data.pincode || '') 
        : (data.pincode || data.postalCode || '');

    // Standardize flat fields for NGOProfile schema
    if (!data.city && cityStr) data.city = cityStr;
    if (!data.state && stateStr) data.state = stateStr;
    if (!data.country && countryStr) data.country = countryStr;
    if (!data.pincode && pincodeStr) data.pincode = pincodeStr;
    if (typeof data.address === 'object') {
        data.address = [addressStr, cityStr, stateStr, pincodeStr].filter(Boolean).join(', ') || addressStr;
    }

    if ((!lat || !lng) && (addressStr || cityStr)) {
        try {
            const geo = await geocodeAddress({
                address: addressStr,
                city: cityStr,
                state: stateStr,
                country: countryStr,
                pincode: pincodeStr
            });
            lat = geo.latitude;
            lng = geo.longitude;
            data.formattedAddress = geo.formattedAddress;
            if (!data.city && geo.city) data.city = geo.city;
            if (!data.state && geo.state) data.state = geo.state;
            if (!data.pincode && geo.pincode) data.pincode = geo.pincode;
        } catch (err) {
            console.warn('[NGOController] Auto-geocode notice:', err.message);
        }
    }

    if (lat && lng) {
        data.latitude = lat;
        data.longitude = lng;
        data.location = {
            type: 'Point',
            coordinates: [lng, lat]
        };
        data.locationConfirmed = true;
    }

    return data;
};

exports.createProfile = async (req, res) => {
    let profile = await NGOProfile.findOne({ userId: req.user.id });
    if (profile) {
        return error(res, 'Profile already exists', 400);
    }

    const enrichedData = await enrichNGOLocation(req.body);
    profile = await NGOProfile.create({
        ...enrichedData,
        userId: req.user.id
    });

    return success(res, profile, 'Profile created successfully', 201);
};

exports.updateProfile = async (req, res) => {
    let profile = await NGOProfile.findOne({ userId: req.user.id });
    if (!profile) {
        return error(res, 'Profile not found', 404);
    }

    const enrichedData = await enrichNGOLocation(req.body);
    profile = await NGOProfile.findByIdAndUpdate(profile._id, enrichedData, { new: true, runValidators: true });
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
