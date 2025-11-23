const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetleaderboard')
        .setDescription('Reset bảng xếp hạng timeout về 0')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            const leaderboardPath = path.join(__dirname, '..', 'data', 'weeklyLeaderBoard.json');
            
            // Reset leaderboard data
            const resetData = {
                lastReset: new Date().toISOString(),
                users: {}
            };
            
            fs.writeFileSync(leaderboardPath, JSON.stringify(resetData, null, 4), 'utf8');
            
            await interaction.reply({
                content: 'Đã reset bảng xếp hạng !',
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error resetting leaderboard:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi reset bảng xếp hạng.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
