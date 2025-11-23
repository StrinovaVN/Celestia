const emotes = require('../functions/emote');

/**
 * Format timeout message as quoted text
 * @param {string} message - The timeout message to display
 * @returns {string} Formatted message with quote prefix
 */
function createTimeoutEmbed(message) {
    return `> ${emotes.timeout} ${message}`;
}

module.exports = createTimeoutEmbed;
