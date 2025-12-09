/**
 * Check if a given date/time is within peak hours
 * Peak hours: 7 PM to 10 PM (19:00 to 22:00)
 * @param {Date} date - Date to check
 * @returns {boolean} True if peak time, false otherwise
 */
function isPeakTime(date) {
  const hour = date.getHours();
  return hour >= 19 && hour < 22;
}

/**
 * Check if a given date is a weekend
 * @param {Date} date - Date to check
 * @returns {boolean} True if weekend, false otherwise
 */
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Get peak multiplier based on time
 * Peak hours (7 PM - 10 PM): 1.3x
 * Weekends: 1.2x
 * Both: 1.4x
 * Normal: 1.0x
 * @param {Date} date - Date to check
 * @returns {number} Multiplier value
 */
function getPeakMultiplier(date) {
  const isPeak = isPeakTime(date);
  const isWeekendDay = isWeekend(date);

  if (isPeak && isWeekendDay) {
    return 1.4; // Both peak time and weekend
  } else if (isPeak) {
    return 1.3; // Peak time only
  } else if (isWeekendDay) {
    return 1.2; // Weekend only
  }
  return 1.0; // Normal time
}

module.exports = {
  isPeakTime,
  isWeekend,
  getPeakMultiplier,
};

