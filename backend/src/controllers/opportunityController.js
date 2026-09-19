const Opportunity = require('../models/Opportunity');
const NGOProfile = require('../models/NGOProfile');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');
const createNotification = require('../utils/createNotification');

exports.getPublicStats = async (req, res) => {
    const activeOpportunities = await Opportunity.countDocuments({ status: { $in: ['published', 'ongoing'] } });
    const verifiedNGOs = await NGOProfile.countDocuments({ verificationStatus: 'approved' });
    const completedEvents = await Opportunity.countDocuments({ status: 'completed' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });

    return success(res, {
        activeOpportunities,
        verifiedNGOs,
        completedEvents,
        totalVolunteers
    }, 'Public platform stats retrieved');
};

exports.getOpportunities = async (req, res) => {
    const { search, category, city, skills, status, sort, page = 1, limit = 10, ngoId, mine } = req.query;

    let query = {};

    // If 'mine' flag or explicit ngoId (for NGO viewing their own opportunities)
    if (mine === 'true' && req.user) {
        query.ngoId = req.user.id;
    } else if (ngoId) {
        query.ngoId = ngoId;
    } else if (status) {
        query.status = status;
    } else {
        // Default public view: only published
        query.status = 'published';
    }

    // If status explicitly provided alongside mine, override
    if ((mine === 'true' || ngoId) && status) {
        query.status = status;
    }

    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
        query.category = category;
    }
    if (city) {
        query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        query.requiredSkills = { $in: skillsArray };
    }

    let sortOptions = {};
    if (sort === 'date_asc') sortOptions.eventDate = 1;
    else if (sort === 'date_desc') sortOptions.eventDate = -1;
    else sortOptions.createdAt = -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const opportunities = await Opportunity.find(query)
        .populate('ngoId', 'name')
        .populate('ngoProfileId', 'organizationName logo verificationStatus')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Opportunity.countDocuments(query);

    return success(res, {
        opportunities,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'Opportunities retrieved successfully');
};


exports.getOpportunity = async (req, res) => {
    const opportunity = await Opportunity.findById(req.params.id)
        .populate('ngoId', 'name email phone')
        .populate('ngoProfileId');
        
    if (!opportunity) {
        return error(res, 'Opportunity not found', 404);
    }
    return success(res, opportunity, 'Opportunity retrieved successfully');
};

const parseOpportunityData = (req) => {
    const data = { ...req.body };

    if (req.body.date && !data.eventDate) {
        data.eventDate = req.body.date;
    }
    if (req.body.time && !data.startTime) {
        data.startTime = req.body.time;
    }
    if (req.body.volunteerCapacity) {
        data.volunteerCapacity = Number(req.body.volunteerCapacity);
    }
    if (req.file) {
        data.image = req.file.path;
    }

    // Parse location if nested or flattened
    let location = req.body.location;
    if (typeof location === 'string') {
        try { location = JSON.parse(location); } catch (e) {}
    }
    if (!location || typeof location !== 'object') {
        location = {
            address: req.body['location[address]'] || req.body.address || '',
            city: req.body['location[city]'] || req.body.city || '',
            state: req.body['location[state]'] || req.body.state || '',
            country: req.body['location[country]'] || req.body.country || ''
        };
    }
    data.location = location;

    // Parse requiredSkills
    let skills = req.body.requiredSkills || req.body['requiredSkills[]'];
    if (typeof skills === 'string') {
        try { 
            skills = JSON.parse(skills); 
        } catch (e) { 
            skills = skills.split(',').map(s => s.trim()).filter(Boolean); 
        }
    } else if (skills && !Array.isArray(skills)) {
        skills = [skills];
    }
    if (skills) {
        data.requiredSkills = skills;
    }

    return data;
};

exports.createOpportunity = async (req, res) => {
    const ngoProfile = await NGOProfile.findOne({ userId: req.user.id });
    if (!ngoProfile || ngoProfile.verificationStatus !== 'approved') {
        return error(res, 'Only verified NGOs can create opportunities', 403);
    }

    const parsedData = parseOpportunityData(req);
    const opportunityData = {
        ...parsedData,
        ngoId: req.user.id,
        ngoProfileId: ngoProfile._id
    };

    const opportunity = await Opportunity.create(opportunityData);
    return success(res, opportunity, 'Opportunity created successfully', 201);
};

exports.updateOpportunity = async (req, res) => {
    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
        return error(res, 'Opportunity not found', 404);
    }

    if (opportunity.ngoId.toString() !== req.user.id) {
        return error(res, 'Not authorized to update this opportunity', 403);
    }

    const parsedData = parseOpportunityData(req);
    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, parsedData, { new: true, runValidators: true });
    return success(res, opportunity, 'Opportunity updated successfully');
};

exports.deleteOpportunity = async (req, res) => {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
        return error(res, 'Opportunity not found', 404);
    }

    if (opportunity.ngoId.toString() !== req.user.id) {
        return error(res, 'Not authorized to delete this opportunity', 403);
    }

    if (!['draft', 'cancelled'].includes(opportunity.status)) {
        return error(res, 'Can only delete draft or cancelled opportunities', 400);
    }

    await opportunity.deleteOne();
    return success(res, null, 'Opportunity deleted successfully');
};

exports.updateOpportunityStatus = async (req, res) => {
    const { status } = req.body;
    let opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
        return error(res, 'Opportunity not found', 404);
    }

    if (opportunity.ngoId.toString() !== req.user.id) {
        return error(res, 'Not authorized', 403);
    }

    opportunity.status = status;
    await opportunity.save();
    
    return success(res, opportunity, `Opportunity status updated to ${status}`);
};

exports.uploadOpportunityImage = async (req, res) => {
    if (!req.file) {
        return error(res, 'Please upload an image', 400);
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
        return error(res, 'Opportunity not found', 404);
    }

    if (opportunity.ngoId.toString() !== req.user.id) {
        return error(res, 'Not authorized', 403);
    }

    opportunity.image = req.file.path;
    await opportunity.save();

    return success(res, opportunity, 'Opportunity image uploaded successfully');
};
