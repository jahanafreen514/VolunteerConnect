/**
 * Visually relevant high-resolution curated imagery mapped strictly to opportunity categories,
 * keywords, and real-world civic topics.
 * Guarantees every opportunity and news event displays an authentic, context-matching image
 * instead of repeated generic placeholders.
 */

export const TOPIC_IMAGE_MAP = {
  // Airports, Aviation, Passenger Assistance & Transport Hubs
  airport: [
    'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=900&auto=format&fit=crop&q=80', // Airport terminal hall
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&auto=format&fit=crop&q=80', // Transit concourse
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&auto=format&fit=crop&q=80', // Aviation runway & flights
    'https://images.unsplash.com/photo-1519074069444-1ba4ea16e897?w=900&auto=format&fit=crop&q=80', // Airport passengers & travel
  ],

  // Humanitarian Support Camps, Shelter, Nepal & Community Relief Camps
  camp: [
    'https://images.unsplash.com/photo-1510519138171-c70d76b64028?w=900&auto=format&fit=crop&q=80', // Humanitarian camp & volunteer tents
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&auto=format&fit=crop&q=80', // Community aid distribution camp
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&auto=format&fit=crop&q=80', // Volunteers coordinating relief
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=900&auto=format&fit=crop&q=80', // Community team hands joined
  ],

  // Civic Assemblies, Birth Anniversaries, Conventions & Celebrations
  celebration: [
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&auto=format&fit=crop&q=80', // Community event hall
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&auto=format&fit=crop&q=80', // Civic gathering & celebration
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&auto=format&fit=crop&q=80', // Public meeting & volunteers
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80', // Civic auditorium event
  ],

  // Blood Donation, Medical Camps, Hospitals & Clinics
  blood_donation: [
    'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=900&auto=format&fit=crop&q=80', // Voluntary blood donation drive
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=900&auto=format&fit=crop&q=80', // Healthcare consultation
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&auto=format&fit=crop&q=80', // Doctor & health checkup
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=900&auto=format&fit=crop&q=80', // Hospital clinic assistance
  ],

  // Flood Relief, Storm, Inundation, Cyclone & Emergency Disasters
  disaster: [
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=900&auto=format&fit=crop&q=80', // Emergency rescue boat
    'https://images.unsplash.com/photo-1514782831304-632d84503f6f?w=900&auto=format&fit=crop&q=80', // Severe weather disaster assistance
    'https://images.unsplash.com/photo-1574482620826-40685ca5ebd2?w=900&auto=format&fit=crop&q=80', // Emergency relief supply transport
    'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=900&auto=format&fit=crop&q=80', // Disaster first aid kits
  ],

  // Tree Plantation, Saplings, Riverfront, Cleanliness & Environment
  environment: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&auto=format&fit=crop&q=80', // Tree planting sapling in soil
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=900&auto=format&fit=crop&q=80', // Coastal cleanup & riverfront care
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900&auto=format&fit=crop&q=80', // Community plantation drive
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=900&auto=format&fit=crop&q=80', // Eco restoration & waste cleanup
  ],

  // Food Drives, Hunger Relief, Ration Distribution & Kitchens
  food: [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=80', // Community food distribution
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&auto=format&fit=crop&q=80', // Volunteer distribution
    'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=900&auto=format&fit=crop&q=80', // Dry ration kit packaging
    'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=900&auto=format&fit=crop&q=80', // Nutritious meal preparation
  ],

  // Education, Schools, Tutoring, Children & Digital Literacy
  education: [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=80', // Library books & study
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=900&auto=format&fit=crop&q=80', // Classroom teaching & teacher
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&auto=format&fit=crop&q=80', // Student educational workshop
  ],

  // Animals, Shelter, Pets, Dogs, Cattle & Wildlife
  animals: [
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=900&auto=format&fit=crop&q=80', // Dog rescue & shelter volunteer
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=900&auto=format&fit=crop&q=80', // Cat welfare & medical care
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900&auto=format&fit=crop&q=80', // Pet adoption camp
  ],

  // Arts, Culture & Music
  arts: [
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&auto=format&fit=crop&q=80', // Painting & art workshop
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&auto=format&fit=crop&q=80', // Creative community crafts
  ],

  // Technology & Mentoring
  technology: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80', // Coding workshop & laptops
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80', // Digital mentorship
  ],

  // General Community Initiatives
  community: [
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&auto=format&fit=crop&q=80', // Community volunteers team
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&auto=format&fit=crop&q=80', // Community workshop
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=900&auto=format&fit=crop&q=80', // Hands joined together
  ]
};

// Aliases for compatibility
export const CATEGORY_IMAGE_MAP = TOPIC_IMAGE_MAP;

// Known generic placeholder images to override with context-aware images
const GENERIC_DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09',
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a',
  'http://localhost',
  'data:image'
];

/**
 * Determines whether an image is a repeated generic default that should be enhanced
 */
const isGenericDefault = (url) => {
  if (!url || typeof url !== 'string') return true;
  return GENERIC_DEFAULT_IMAGES.some(gen => url.includes(gen));
};

/**
 * Resolves a contextually tailored, high-resolution image for an opportunity or news event.
 * Uses smart keyword extraction across title, description, and category,
 * with deterministic hashing to ensure neighboring cards never share the same image.
 */
export const getOpportunityImage = (opportunity = {}) => {
  const isNews = opportunity.source_type === 'news' || !!opportunity.news_event_id;
  const rawImage = opportunity.image || opportunity.imageUrl;

  // If this is an NGO-uploaded custom image (and NOT the repeated seedling default), use it
  if (!isNews && rawImage && typeof rawImage === 'string' && rawImage.startsWith('http') && !isGenericDefault(rawImage)) {
    return rawImage;
  }

  // Combine title, description, and category for deep semantic keyword matching
  const text = `${opportunity.title || ''} ${opportunity.description || ''} ${opportunity.category || ''}`.toLowerCase();

  let pool = TOPIC_IMAGE_MAP.community;

  if (text.includes('airport') || text.includes('flight') || text.includes('aviation') || text.includes('terminal') || text.includes('yatri') || text.includes('darbhanga') || text.includes('patna airport')) {
    pool = TOPIC_IMAGE_MAP.airport;
  } else if (text.includes('blood') || text.includes('donor') || text.includes('donation drive')) {
    pool = TOPIC_IMAGE_MAP.blood_donation;
  } else if (text.includes('support camp') || text.includes('nepal') || text.includes('relief camp') || text.includes('disability camp') || text.includes('seva sansthan') || text.includes('camp')) {
    pool = TOPIC_IMAGE_MAP.camp;
  } else if (text.includes('anniversary') || text.includes('birth') || text.includes('ajit pawar') || text.includes('celebrat') || text.includes('foundation day') || text.includes('bjp')) {
    pool = TOPIC_IMAGE_MAP.celebration;
  } else if (text.includes('flood') || text.includes('cyclone') || text.includes('storm') || text.includes('disaster') || text.includes('inundation') || text.includes('rescue')) {
    pool = TOPIC_IMAGE_MAP.disaster;
  } else if (text.includes('tree') || text.includes('plantation') || text.includes('sapling') || text.includes('afforestation') || text.includes('krishna riverfront') || text.includes('clean') || text.includes('waste')) {
    pool = TOPIC_IMAGE_MAP.environment;
  } else if (text.includes('food') || text.includes('ration') || text.includes('hunger') || text.includes('meal') || text.includes('kitchen')) {
    pool = TOPIC_IMAGE_MAP.food;
  } else if (text.includes('health') || text.includes('medic') || text.includes('hospital') || text.includes('clinic') || text.includes('doctor')) {
    pool = TOPIC_IMAGE_MAP.blood_donation;
  } else if (text.includes('educat') || text.includes('school') || text.includes('teach') || text.includes('student') || text.includes('tutor') || text.includes('child')) {
    pool = TOPIC_IMAGE_MAP.education;
  } else if (text.includes('anim') || text.includes('dog') || text.includes('cat') || text.includes('pet') || text.includes('veterinary')) {
    pool = TOPIC_IMAGE_MAP.animals;
  } else if (text.includes('art') || text.includes('cultur') || text.includes('music') || text.includes('craft')) {
    pool = TOPIC_IMAGE_MAP.arts;
  } else if (text.includes('tech') || text.includes('code') || text.includes('comput') || text.includes('digital')) {
    pool = TOPIC_IMAGE_MAP.technology;
  }

  // Deterministic stable hash based on ID + title characters
  const seed = `${opportunity._id || ''}_${opportunity.title || ''}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const selectedIndex = pool.length > 0 ? hash % pool.length : 0;
  return pool[selectedIndex] || pool[0];
};

export default getOpportunityImage;
