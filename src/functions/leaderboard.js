const fs = require('fs');
const path = require('path');

/**
 * Get the start of current week (Monday 00:00:00)
 * @returns {Date} Start of the current week
 */
function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

/**
 * Load leaderboard data and reset if needed
 * @returns {Object} Leaderboard data
 */
function loadLeaderboard() {
    const leaderboardPath = path.join(__dirname, '..', 'data', 'weeklyLeaderBoard.json');
    const data = JSON.parse(fs.readFileSync(leaderboardPath, 'utf8'));
    
    const weekStart = getWeekStart();
    const lastReset = data.lastReset ? new Date(data.lastReset) : null;
    
    // Reset if new week
    if (!lastReset || lastReset < weekStart) {
        data.users = {};
        data.lastReset = weekStart.toISOString();
        fs.writeFileSync(leaderboardPath, JSON.stringify(data, null, 4), 'utf8');
    }
    
    return data;
}

/**
 * Increment timeout count for a user
 * @param {string} userId - Discord user ID
 * @param {string} username - Discord username
 * @param {number} duration - Timeout duration in seconds
 */
function incrementTimeout(userId, username, duration) {
    const data = loadLeaderboard();
    
    if (!data.users[userId]) {
        data.users[userId] = {
            username: username,
            count: 0,
            totalDuration: 0
        };
    }
    
    data.users[userId].count++;
    data.users[userId].totalDuration = (data.users[userId].totalDuration || 0) + duration;
    data.users[userId].username = username; // Update username in case it changed
    
    const leaderboardPath = path.join(__dirname, '..', 'data', 'weeklyLeaderBoard.json');
    fs.writeFileSync(leaderboardPath, JSON.stringify(data, null, 4), 'utf8');
}

/**
 * Get top users sorted by timeout count, then by total duration
 * @param {number} limit - Number of top users to return
 * @returns {Array} Array of {userId, username, count, totalDuration}
 */
function getTopUsers(limit = 10) {
    const data = loadLeaderboard();
    
    return Object.entries(data.users)
        .map(([userId, userData]) => ({
            userId,
            username: userData.username,
            count: userData.count,
            totalDuration: userData.totalDuration || 0
        }))
        .sort((a, b) => {
            // First sort by count (descending)
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            // If count is equal, sort by total duration (descending)
            return b.totalDuration - a.totalDuration;
        })
        .slice(0, limit);
}

module.exports = {
    loadLeaderboard,
    incrementTimeout,
    getTopUsers,
    getWeekStart
};
