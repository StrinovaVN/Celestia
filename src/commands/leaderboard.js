const { SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getTopUsers, getWeekStart } = require('../functions/leaderboard');
const createLeaderboardEmbed = require('../return/leaderboard');

const USERS_PER_PAGE = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Xem bảng xếp hạng người bị timeout nhiều nhất trong tuần'),
    
    async execute(interaction) {
        try {
            const allUsers = getTopUsers(); // Get all users
            const weekStart = getWeekStart();
            
            if (allUsers.length === 0) {
                await interaction.reply({
                    content: 'Chưa có ai bị timeout trong tuần này!',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
            
            const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);
            let currentPage = 0;
            
            const getPageUsers = (page) => {
                const start = page * USERS_PER_PAGE;
                const end = start + USERS_PER_PAGE;
                return allUsers.slice(start, end).map((user, index) => ({
                    ...user,
                    rank: start + index + 1
                }));
            };
            
            const createButtons = (page) => {
                const row = new ActionRowBuilder();
                
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('leaderboard_first')
                        .setLabel('⏮️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('leaderboard_prev')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('leaderboard_page')
                        .setLabel(`${page + 1}/${totalPages}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('leaderboard_next')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages - 1),
                    new ButtonBuilder()
                        .setCustomId('leaderboard_last')
                        .setLabel('⏭️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page >= totalPages - 1)
                );
                
                return row;
            };
            
            // Send initial message
            const pageUsers = getPageUsers(currentPage);
            const embed = createLeaderboardEmbed(pageUsers, weekStart, currentPage + 1, totalPages);
            const components = totalPages > 1 ? [createButtons(currentPage)] : [];
            
            await interaction.reply({ 
                embeds: [embed], 
                components,
                withResponse: true 
            });
            
            const response = await interaction.fetchReply();
            
            if (totalPages <= 1) return;
            
            // Create collector for button interactions
            const collector = response.createMessageComponentCollector({ 
                time: 300000 // 5 minutes
            });
            
            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({ 
                        content: 'Chỉ người dùng lệnh mới có thể chuyển trang!', 
                        flags: MessageFlags.Ephemeral 
                    });
                    return;
                }
                
                switch (i.customId) {
                    case 'leaderboard_first':
                        currentPage = 0;
                        break;
                    case 'leaderboard_prev':
                        currentPage = Math.max(0, currentPage - 1);
                        break;
                    case 'leaderboard_next':
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                        break;
                    case 'leaderboard_last':
                        currentPage = totalPages - 1;
                        break;
                }
                
                const newPageUsers = getPageUsers(currentPage);
                const newEmbed = createLeaderboardEmbed(newPageUsers, weekStart, currentPage + 1, totalPages);
                const newButtons = createButtons(currentPage);
                
                await i.update({ embeds: [newEmbed], components: [newButtons] });
            });
            
            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });
            
        } catch (error) {
            console.error('Error showing leaderboard:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi hiển thị bảng xếp hạng.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
