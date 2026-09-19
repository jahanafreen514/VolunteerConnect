import { format } from 'date-fns';

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

export default formatDateSafe;
