const { EmbedBuilder } = require('discord.js');

/**
 * Create leaderboard embed
 * @param {Array} topUsers - Array of top users with rank property
 * @param {Date} weekStart - Start of the week
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @returns {EmbedBuilder} Leaderboard embed
 */
function createLeaderboardEmbed(topUsers, weekStart, currentPage = 1, totalPages = 1) {
    let description = `**Tuần bắt đầu:** <t:${Math.floor(weekStart.getTime() / 1000)}:F>\n\n`;
    
    topUsers.forEach((user) => {
        const minutes = Math.floor(user.totalDuration / 60);
        const seconds = user.totalDuration % 60;
        const timeStr = minutes > 0 ? `${minutes}p ${seconds}s` : `${seconds}s`;
        description += `**${user.rank}.** <@${user.userId}>\n`;
        description += `   └ **${user.count}** lần | Tổng: **${timeStr}**\n`;
    });
    
    const title = totalPages > 1 
        ? `Bảng Xếp Hạng Nổ Mình Tuần (Trang ${currentPage}/${totalPages})`
        : 'Bảng Xếp Hạng Nổ Mình Tuần';
    
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0xFFD700) // Gold color
        .setTimestamp()
        .setFooter({ text: 'Reset vào 0h thứ 2 hàng tuần' });
}

module.exports = createLeaderboardEmbed;
