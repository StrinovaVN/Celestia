const fs = require('fs');
const path = require('path');

/**
 * Get a random quote from respond.json
 * @returns {string} Random quote with ${username} and ${time} placeholders
 */
function randomQuote() {
    try {
        const respondPath = path.join(__dirname, '..', 'data', 'respond.json');
        const data = JSON.parse(fs.readFileSync(respondPath, 'utf8'));
        
        // Get all quotes from the array
        const quotes = Object.values(data[0]);
        
        // Return a random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    } catch (error) {
        console.error('Error reading respond.json:', error);
        return '${username} bị timeout trong ${time} giây.';
    }
}

module.exports = randomQuote;
