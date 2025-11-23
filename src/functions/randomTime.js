/**
 * Generate a random time between min and max seconds
 * @param {number} min - Minimum time in seconds
 * @param {number} max - Maximum time in seconds
 * @returns {number} Random time in seconds
 */
function randomTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = randomTime;
