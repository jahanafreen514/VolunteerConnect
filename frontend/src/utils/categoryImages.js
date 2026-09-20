/**
 * Visually relevant high-resolution curated imagery mapped strictly to opportunity categories.
 * Guarantees every opportunity displays an authentic, high-quality, relevant image.
 */

export const CATEGORY_IMAGE_MAP = {
  // Environment: tree plantation, cleanup, recycling, ecological initiatives
  environment: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80', // tree planting
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80', // beach cleanup
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80', // recycling / eco care
  ],
  // Education: teaching, books, mentoring, classroom
  education: [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', // library / books / study
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80', // teacher in classroom
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80', // students learning
  ],
  // Healthcare / Health: medical camp, health checkup, blood drive
  health: [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80', // healthcare worker
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80', // medical team consultation
    'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=80', // blood drive / clinic
  ],
  healthcare: [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
  ],
  // Food / Community Support: food distribution, community kitchens, hunger relief
  food: [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80', // community food / charity
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80', // volunteer distribution
    'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&auto=format&fit=crop&q=80', // food bank sorting
  ],
  // Community / Community Service
  community: [
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80', // diverse community volunteers
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80', // group workshop
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80', // team hands together
  ],
  // Disaster Relief: floods, earthquakes, emergency community aid
  'disaster-relief': [
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80', // emergency response rescue
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80', // community relief aid
    'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&auto=format&fit=crop&q=80', // medical emergency packages
  ],
  // Animal Welfare / Animals: animal care, rescue shelters, veterinary
  animals: [
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80', // dog shelter volunteer
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=800&auto=format&fit=crop&q=80', // cat rescue
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop&q=80', // pet adoption drive
  ],
  // Arts & Culture
  arts: [
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80', // arts & painting
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80', // creative workshop
  ],
  // Technology
  technology: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80', // coding laptop
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80', // mentoring digital skills
  ]
};

/**
 * Resolves a high-quality relevant image for an opportunity.
 * Never returns empty or mismatched placeholders.
 */
export const getOpportunityImage = (opportunity = {}) => {
  // If opportunity has an explicit image URL provided by NGO, verify it's valid
  if (opportunity.image && typeof opportunity.image === 'string' && opportunity.image.startsWith('http')) {
    return opportunity.image;
  }
  if (opportunity.imageUrl && typeof opportunity.imageUrl === 'string' && opportunity.imageUrl.startsWith('http')) {
    return opportunity.imageUrl;
  }

  // Normalize category
  const rawCat = (opportunity.category || '').toLowerCase().trim();
  let key = 'community';

  if (rawCat.includes('environ') || rawCat.includes('tree') || rawCat.includes('plant') || rawCat.includes('clean')) {
    key = 'environment';
  } else if (rawCat.includes('educat') || rawCat.includes('teach') || rawCat.includes('school') || rawCat.includes('tutor')) {
    key = 'education';
  } else if (rawCat.includes('health') || rawCat.includes('medic') || rawCat.includes('blood') || rawCat.includes('camp')) {
    key = 'health';
  } else if (rawCat.includes('food') || rawCat.includes('meal') || rawCat.includes('ration') || rawCat.includes('hunger')) {
    key = 'food';
  } else if (rawCat.includes('disaster') || rawCat.includes('flood') || rawCat.includes('cyclone') || rawCat.includes('relief')) {
    key = 'disaster-relief';
  } else if (rawCat.includes('anim') || rawCat.includes('pet') || rawCat.includes('dog') || rawCat.includes('cat')) {
    key = 'animals';
  } else if (rawCat.includes('art') || rawCat.includes('cultur') || rawCat.includes('music')) {
    key = 'arts';
  } else if (rawCat.includes('tech') || rawCat.includes('code') || rawCat.includes('comput')) {
    key = 'technology';
  }

  const list = CATEGORY_IMAGE_MAP[key] || CATEGORY_IMAGE_MAP.community;
  // Use opportunity ID or title character code to produce a stable deterministic pick
  const str = opportunity._id || opportunity.title || key;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash + str.charCodeAt(i)) % list.length;
  }
  return list[hash] || list[0];
};

export default getOpportunityImage;
