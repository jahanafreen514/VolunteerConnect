const NGOProfile = require('../models/NGOProfile');
const Opportunity = require('../models/Opportunity');
const NewsEvent = require('../models/NewsEvent');
const { geocodeAddress, reverseGeocode, calculateDistance } = require('../services/geocodingService');
const { processNewsAndSyncOpportunities } = require('../services/newsService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Forward Geocoding: Address to Coordinates
 */
const geocode = async (req, res) => {
  try {
    const { address, city, state, country, pincode, query } = req.body;
    if (!address && !city && !query) {
      return sendError(res, 'Please provide an address or city to geocode.', 400);
    }
    const result = await geocodeAddress({ address, city, state, country, pincode, query });
    return sendSuccess(res, 'Address geocoded successfully', result);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Reverse Geocoding: Coordinates to Address
 */
const reverse = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return sendError(res, 'Please provide latitude and longitude.', 400);
    }
    const result = await reverseGeocode(parseFloat(latitude), parseFloat(longitude));
    return sendSuccess(res, 'Coordinates reverse-geocoded successfully', result);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Get Nearby NGOs and Opportunities sorted by real distance
 */
const getNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 50, category } = req.query;

    if (!lat || !lng) {
      return sendError(res, 'Latitude (lat) and longitude (lng) query parameters are required.', 400);
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDistanceKm = parseFloat(radius);

    // Fetch verified NGOs
    const ngos = await NGOProfile.find({
      verificationStatus: 'approved',
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('-verificationDocuments');

    const nearbyNGOs = [];
    for (const ngo of ngos) {
      const dist = calculateDistance(userLat, userLng, ngo.latitude, ngo.longitude);
      if (dist !== null && dist <= maxDistanceKm) {
        nearbyNGOs.push({
          ...ngo.toObject(),
          distanceKm: dist
        });
      }
    }
    nearbyNGOs.sort((a, b) => a.distanceKm - b.distanceKm);

    // Fetch active opportunities
    const oppQuery = {
      status: 'published',
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null }
    };

    if (category && category.toLowerCase() !== 'all') {
      oppQuery.category = new RegExp(category, 'i');
    }

    const opportunities = await Opportunity.find(oppQuery)
      .populate('ngoProfileId', 'organizationName logo phone email category')
      .sort({ createdAt: -1 });

    const nearbyOpportunities = [];
    for (const opp of opportunities) {
      const dist = calculateDistance(
        userLat,
        userLng,
        opp.location.latitude,
        opp.location.longitude
      );
      if (dist !== null && dist <= maxDistanceKm) {
        nearbyOpportunities.push({
          ...opp.toObject(),
          distanceKm: dist
        });
      }
    }
    nearbyOpportunities.sort((a, b) => a.distanceKm - b.distanceKm);

    return sendSuccess(res, 'Nearby entities fetched successfully', {
      userLocation: { latitude: userLat, longitude: userLng },
      radiusKm: maxDistanceKm,
      ngos: nearbyNGOs,
      opportunities: nearbyOpportunities,
      totalNGOs: nearbyNGOs.length,
      totalOpportunities: nearbyOpportunities.length
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Get Active Real-World News Events
 */
const getNewsEvents = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    let events = await NewsEvent.find({
      expires_at: { $gte: new Date() }
    }).sort({ published_at: -1 }).limit(20);

    // Auto-seed or process news if empty
    if (events.length === 0) {
      await processNewsAndSyncOpportunities();
      events = await NewsEvent.find({
        expires_at: { $gte: new Date() }
      }).sort({ published_at: -1 }).limit(20);
    }

    let formattedEvents = events.map(e => e.toObject());

    // If user coordinates provided, attach distance
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      formattedEvents = formattedEvents.map(e => {
        const dist = calculateDistance(userLat, userLng, e.location.latitude, e.location.longitude);
        return {
          ...e,
          distanceKm: dist
        };
      });
      formattedEvents.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    }

    return sendSuccess(res, 'News events retrieved successfully', formattedEvents);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Trigger Manual News Fetch & Sync
 */
const refreshNews = async (req, res) => {
  try {
    const result = await processNewsAndSyncOpportunities();
    return sendSuccess(res, 'News pipeline triggered successfully', result);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * NGO Adopts / Confirms a News Event into an Official Volunteer Opportunity
 */
const adoptNewsEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const ngoProfile = await NGOProfile.findOne({ userId });
    if (!ngoProfile) {
      return sendError(res, 'NGO profile required to adopt events.', 404);
    }

    const newsEvent = await NewsEvent.findById(id);
    if (!newsEvent) {
      return sendError(res, 'News event not found.', 404);
    }

    // Update existing opportunity or create confirmed one
    let opp = await Opportunity.findOne({ news_event_id: newsEvent._id });
    if (!opp) {
      opp = new Opportunity({
        title: newsEvent.title,
        description: newsEvent.summary,
        category: 'disaster-relief',
        source_type: 'ngo',
        location: newsEvent.location,
        eventDate: new Date(Date.now() + 24 * 3600 * 1000)
      });
    }

    opp.ngoId = userId;
    opp.ngoProfileId = ngoProfile._id;
    opp.source_type = 'ngo';
    opp.verification_status = 'confirmed';
    opp.status = 'published';
    opp.description = `${newsEvent.summary}\n\n✅ CONFIRMED BY ORGANIZER: ${ngoProfile.organizationName} has officially adopted and verified this initiative on VolunteerConnect.`;
    await opp.save();

    newsEvent.status = 'confirmed';
    newsEvent.adoptedOpportunityId = opp._id;
    await newsEvent.save();

    return sendSuccess(res, 'Event adopted and verified successfully by NGO', {
      newsEvent,
      opportunity: opp
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Volunteer / Community requests NGO support for a news event
 */
const requestSupport = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await NewsEvent.findById(id);
    if (!event) {
      return sendError(res, 'News event not found', 404);
    }
    event.supportRequestsCount = (event.supportRequestsCount || 0) + 1;
    await event.save();

    return sendSuccess(res, 'Support request recorded. Nearby organizations will be alerted.', {
      supportRequestsCount: event.supportRequestsCount
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * NGO Rejects / Dismisses a news event
 */
const rejectNewsEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const newsEvent = await NewsEvent.findById(id);
    if (!newsEvent) {
      return sendError(res, 'News event not found.', 404);
    }
    newsEvent.status = 'rejected';
    await newsEvent.save();
    return sendSuccess(res, 'Event rejected/dismissed', newsEvent);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

module.exports = {
  geocode,
  reverse,
  getNearby,
  getNewsEvents,
  refreshNews,
  adoptNewsEvent,
  rejectNewsEvent,
  requestSupport
};
