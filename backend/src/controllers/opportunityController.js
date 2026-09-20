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

    // Automatic maintenance: mark past/expired opportunities as completed
    const now = new Date();
    try {
        await Opportunity.updateMany(
            {
                status: 'published',
                $or: [
                    { expires_at: { $lt: now } },
                    { eventDate: { $lt: new Date(now.getTime() - 24 * 3600 * 1000) } }
                ]
            },
            { status: 'completed' }
        );
    } catch (cleanErr) {
        console.warn('[OpportunityController] Auto-cleanup notice:', cleanErr.message);
    }

    let query = {};

    // If 'mine' flag or explicit ngoId (for NGO viewing their own opportunities)
    if (mine === 'true' && req.user) {
        query.ngoId = req.user.id;
    } else if (ngoId) {
        query.ngoId = ngoId;
    } else if (status) {
        query.status = status;
    } else {
        // Default public view: only published and active (not completed past events)
        query.status = 'published';
        query.$or = [
            { eventDate: { $gte: new Date(now.getTime() - 24 * 3600 * 1000) } },
            { eventDate: null },
            { eventDate: { $exists: false } }
        ];
    }

    // If status explicitly provided alongside mine, override
    if ((mine === 'true' || ngoId) && status) {
        query.status = status;
    }

    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }
    if (category && category.toLowerCase() !== 'all') {
        const catTrimmed = category.trim().toLowerCase();
        let catPattern = catTrimmed;
        if (catTrimmed === 'environment') {
            catPattern = 'environment';
        } else if (catTrimmed === 'education') {
            catPattern = 'education';
        } else if (catTrimmed === 'health' || catTrimmed === 'healthcare') {
            catPattern = '(health|healthcare)';
        } else if (catTrimmed === 'food') {
            catPattern = '(food|community)';
        } else if (catTrimmed === 'community' || catTrimmed === 'community service') {
            catPattern = '(community|social)';
        } else if (catTrimmed.includes('disaster')) {
            catPattern = '(disaster|relief)';
        } else if (catTrimmed.includes('anim')) {
            catPattern = '(anim|pet)';
        }
        query.category = { $regex: new RegExp(catPattern, 'i') };
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

const CATEGORY_DEFAULT_IMAGES = {
    'Environment': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
    'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&auto=format&fit=crop&q=80',
    'Healthcare': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80',
    'Health': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80',
    'Community': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000&auto=format&fit=crop&q=80',
    'Community Service': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000&auto=format&fit=crop&q=80',
    'Disaster Relief': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1000&auto=format&fit=crop&q=80',
    'Animals': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop&q=80',
    'Animal Welfare': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop&q=80',
    'Arts & Culture': 'https://images.unsplash.com/photo-1460661419200-1801a9b2142a?w=1000&auto=format&fit=crop&q=80',
    'Technology': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80',
    'General': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000&auto=format&fit=crop&q=80'
};

const getCategoryDefaultImage = (category) => {
    if (!category) return CATEGORY_DEFAULT_IMAGES.General;
    const cat = category.toString().trim();
    if (CATEGORY_DEFAULT_IMAGES[cat]) return CATEGORY_DEFAULT_IMAGES[cat];
    const catLower = cat.toLowerCase();
    if (catLower.includes('env') || catLower.includes('tree') || catLower.includes('clean') || catLower.includes('water')) {
        return CATEGORY_DEFAULT_IMAGES.Environment;
    }
    if (catLower.includes('edu') || catLower.includes('teach') || catLower.includes('school') || catLower.includes('child')) {
        return CATEGORY_DEFAULT_IMAGES.Education;
    }
    if (catLower.includes('health') || catLower.includes('medic') || catLower.includes('blood')) {
        return CATEGORY_DEFAULT_IMAGES.Healthcare;
    }
    if (catLower.includes('anim') || catLower.includes('pet') || catLower.includes('dog')) {
        return CATEGORY_DEFAULT_IMAGES.Animals;
    }
    if (catLower.includes('disaster') || catLower.includes('flood') || catLower.includes('relief') || catLower.includes('fire')) {
        return CATEGORY_DEFAULT_IMAGES['Disaster Relief'];
    }
    if (catLower.includes('art') || catLower.includes('cultur') || catLower.includes('music')) {
        return CATEGORY_DEFAULT_IMAGES['Arts & Culture'];
    }
    if (catLower.includes('tech') || catLower.includes('code') || catLower.includes('digital')) {
        return CATEGORY_DEFAULT_IMAGES.Technology;
    }
    return CATEGORY_DEFAULT_IMAGES.Community;
};

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const opportunities = await Opportunity.find(query)
        .populate('ngoId', 'name')
        .populate('ngoProfileId', 'organizationName logo verificationStatus')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Opportunity.countDocuments(query);

    const enrichedOpportunities = opportunities.map(opp => {
        const obj = opp.toObject ? opp.toObject() : { ...opp };
        if (!obj.image) {
            obj.image = getCategoryDefaultImage(obj.category);
        }
        return obj;
    });

    return success(res, {
        opportunities: enrichedOpportunities,
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
    
    const oppObj = opportunity.toObject ? opportunity.toObject() : { ...opportunity };
    if (!oppObj.image) {
        oppObj.image = getCategoryDefaultImage(oppObj.category);
    }
    return success(res, oppObj, 'Opportunity retrieved successfully');
};

const { geocodeAddress } = require('../services/geocodingService');

const parseOpportunityData = async (req) => {
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
    } else if (!data.image) {
        data.image = getCategoryDefaultImage(data.category);
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
            country: req.body['location[country]'] || req.body.country || 'India',
            pincode: req.body['location[pincode]'] || req.body.pincode || '',
            latitude: req.body['location[latitude]'] || req.body.latitude,
            longitude: req.body['location[longitude]'] || req.body.longitude
        };
    }

    // Auto-geocode if coordinates not provided
    if ((!location.latitude || !location.longitude) && (location.address || location.city)) {
        try {
            const geo = await geocodeAddress(location);
            location.latitude = geo.latitude;
            location.longitude = geo.longitude;
            location.formattedAddress = geo.formattedAddress;
            if (!location.city && geo.city) location.city = geo.city;
            if (!location.state && geo.state) location.state = geo.state;
        } catch (err) {
            console.warn('[OpportunityController] Auto-geocode notice:', err.message);
        }
    }

    if (location.latitude && location.longitude) {
        location.latitude = parseFloat(location.latitude);
        location.longitude = parseFloat(location.longitude);
        location.geo = {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
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
    let ngoProfile = await NGOProfile.findOne({ userId: req.user.id });
    if (!ngoProfile) {
        ngoProfile = await NGOProfile.create({
            userId: req.user.id,
            organizationName: req.user.name || 'Community NGO Partner',
            verificationStatus: 'pending'
        });
    }

    const parsedData = await parseOpportunityData(req);
    const opportunityData = {
        ...parsedData,
        ngoId: req.user.id,
        ngoProfileId: ngoProfile._id,
        status: parsedData.status || 'published'
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

    const parsedData = await parseOpportunityData(req);
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
