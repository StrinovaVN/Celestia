const fs = require('fs');
const path = require('path');

/**
 * Get a random anti-quote from antiRespond.json for immune users
 * @returns {string} Random anti-quote with ${username} and ${immune_type} placeholders
 */
function randomAntiQuote() {
    try {
        const antiRespondPath = path.join(__dirname, '..', 'data', 'antiRespond.json');
        const data = JSON.parse(fs.readFileSync(antiRespondPath, 'utf8'));
        
        // Get all quotes from the array
        const quotes = Object.values(data[0]);
        
        // Return a random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    } catch (error) {
        console.error('Error reading antiRespond.json:', error);
        return '${username} có quyền miễn nhiễm với timeout.';
    }
}

module.exports = randomAntiQuote;
