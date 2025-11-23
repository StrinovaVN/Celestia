const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Xem cấu hình hiện tại của bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        try {
            // Load settings from settings.json
            const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            // Get actual values (with fallback to env)
            const rate = settings.rate !== null ? settings.rate : (parseFloat(process.env.RATE) || 0.1);
            const minTime = settings.minTime !== null ? settings.minTime : (parseInt(process.env.MIN_TIME) || 60);
            const maxTime = settings.maxTime !== null ? settings.maxTime : (parseInt(process.env.MAX_TIME) || 120);
            const showImmuneMessage = settings.showImmuneMessage !== null ? settings.showImmuneMessage : (process.env.SHOW_IMMUNE_MESSAGE === 'true');
            
            // Get respond counts
            const respondPath = path.join(__dirname, '..', 'data', 'respond.json');
            const respondData = JSON.parse(fs.readFileSync(respondPath, 'utf8'));
            const respondCount = Object.keys(respondData[0]).length;
            
            const antiRespondPath = path.join(__dirname, '..', 'data', 'antiRespond.json');
            const antiRespondData = JSON.parse(fs.readFileSync(antiRespondPath, 'utf8'));
            const antiRespondCount = Object.keys(antiRespondData[0]).length;
            
            // Build settings message
            const settingsMessage = `**Cấu hình hiện tại:**\n\n` +
                `**Tỉ lệ timeout:** ${rate.toFixed(1)}% ${settings.rate !== null ? '*(đã chỉnh)*' : '*(mặc định)*'}\n` +
                `**Thời gian timeout:**\n` +
                `  • Tối thiểu: ${minTime}s ${settings.minTime !== null ? '*(đã chỉnh)*' : '*(mặc định)*'}\n` +
                `  • Tối đa: ${maxTime}s ${settings.maxTime !== null ? '*(đã chỉnh)*' : '*(mặc định)*'}\n` +
                `**Hiển thị respond với người có quyền:** ${showImmuneMessage ? 'Bật' : 'Tắt'} ${settings.showImmuneMessage !== null ? '*(đã chỉnh)*' : '*(mặc định)*'}\n\n` +
                `**Số lượng respond:**\n` +
                `  • Respond thường: ${respondCount}\n` +
                `  • Respond miễn nhiễm: ${antiRespondCount}`;
            
            await interaction.reply({
                content: settingsMessage,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error reading settings:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi đọc cấu hình.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
