const emotes = require('../functions/emote');

/**
 * Format immunity message as quoted text
 * @param {string} message - The immunity message to display
 * @returns {string} Formatted message with quote prefix
 */
function createImmunityEmbed(message) {
    return `> ${emotes.immunity} ${message}`;
}

module.exports = createImmunityEmbed;
