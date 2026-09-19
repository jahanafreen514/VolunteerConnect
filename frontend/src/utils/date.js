import { format, formatDistanceToNow } from 'date-fns';

/**
 * Safely format a date without throwing RangeError on invalid or undefined dates.
 * @param {string|Date|number} dateVal
 * @param {string} pattern
 * @param {string} fallback
 * @returns {string}
 */
export const formatDateSafe = (dateVal, pattern = 'MMM d, yyyy', fallback = 'TBA') => {
  if (!dateVal) return fallback;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;
  try {
    return format(d, pattern);
  } catch (err) {
    return fallback;
  }
};

/**
 * Safely format distance to now without throwing on invalid dates.
 * @param {string|Date|number} dateVal
 * @param {object} options
 * @param {string} fallback
 * @returns {string}
 */
export const formatDistanceToNowSafe = (dateVal, options = { addSuffix: true }, fallback = 'recently') => {
  if (!dateVal) return fallback;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;
  try {
    return formatDistanceToNow(d, options);
  } catch (err) {
    return fallback;
  }
};

export default formatDateSafe;
