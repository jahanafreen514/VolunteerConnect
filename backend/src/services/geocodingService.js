const axios = require('axios');

// In-memory cache to prevent redundant external API hits
const geocodeCache = new Map();

// Known fallback coordinates for major hubs to guarantee resilience if network fails
const CITY_FALLBACKS = {
  'delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi', country: 'India' },
  'mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra', country: 'India' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka', country: 'India' },
  'bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka', country: 'India' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana', country: 'India' },
  'chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', country: 'India' },
  'kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal', country: 'India' },
  'pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra', country: 'India' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat', country: 'India' },
  'guntur': { lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh', country: 'India' },
  'vijayawada': { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh', country: 'India' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh', country: 'India' },
  'tirupati': { lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh', country: 'India' },
  'jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan', country: 'India' },
  'lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', country: 'India' },
  'patna': { lat: 25.5941, lng: 85.1376, state: 'Bihar', country: 'India' },
  'bhopal': { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh', country: 'India' },
  'kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala', country: 'India' },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, state: 'Kerala', country: 'India' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu', country: 'India' }
};

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place (e.g. 3.2 km)
}

/**
 * Forward Geocoding: Address/City/Pincode -> Lat, Lng, formatted address.
 */
async function geocodeAddress({ address, city, state, country = 'India', pincode, query }) {
  const fullQuery = query || [address, city, state, pincode, country].filter(Boolean).join(', ');
  const cacheKey = fullQuery.toLowerCase().trim();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // Attempt Nominatim OpenStreetMap query
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: fullQuery,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'VolunteerConnect-CivicPlatform/1.0 (contact@volunteerconnect.org)'
      },
      timeout: 5000
    });

    if (response.data && response.data.length > 0) {
      const match = response.data[0];
      const result = {
        latitude: parseFloat(match.lat),
        longitude: parseFloat(match.lon),
        formattedAddress: match.display_name,
        city: match.address.city || match.address.town || match.address.village || match.address.county || city || '',
        state: match.address.state || state || '',
        country: match.address.country || country || 'India',
        pincode: match.address.postcode || pincode || ''
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn(`[Geocoding] Nominatim query failed for "${fullQuery}": ${err.message}. Checking fallback.`);
  }

  // Check city fallback if specific city is recognized
  const cleanCity = (city || query || '').toLowerCase().trim();
  for (const [knownCity, data] of Object.entries(CITY_FALLBACKS)) {
    if (cleanCity.includes(knownCity)) {
      const fallbackResult = {
        latitude: data.lat,
        longitude: data.lng,
        formattedAddress: `${city || knownCity}, ${data.state}, ${data.country}`,
        city: city || knownCity,
        state: data.state,
        country: data.country,
        pincode: pincode || ''
      };
      geocodeCache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  // Default fallback center (Guntur / Hyderabad, Andhra Pradesh/Telangana hub)
  const defaultCenter = {
    latitude: 16.3067,
    longitude: 80.4365,
    formattedAddress: fullQuery,
    city: city || 'Guntur',
    state: state || 'Andhra Pradesh',
    country: 'India',
    pincode: pincode || ''
  };
  return defaultCenter;
}

/**
 * Reverse Geocoding: Lat, Lng -> Formatted address and components.
 */
async function reverseGeocode(latitude, longitude) {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'VolunteerConnect-CivicPlatform/1.0 (contact@volunteerconnect.org)'
      },
      timeout: 5000
    });

    if (response.data && response.data.address) {
      const addr = response.data.address;
      const result = {
        latitude,
        longitude,
        formattedAddress: response.data.display_name,
        address: addr.road || addr.suburb || addr.neighbourhood || '',
        city: addr.city || addr.town || addr.village || addr.county || '',
        state: addr.state || '',
        country: addr.country || 'India',
        pincode: addr.postcode || ''
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn(`[Geocoding] Reverse geocoding failed for ${latitude}, ${longitude}: ${err.message}`);
  }

  return {
    latitude,
    longitude,
    formattedAddress: `Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    city: '',
    state: '',
    country: 'India',
    pincode: ''
  };
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
  calculateDistance
};
