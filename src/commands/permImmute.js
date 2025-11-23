const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('immute')
        .setDescription('Bật/tắt hiển thị tin nhắn khi timeout người có quyền miễn nhiễm')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        try {
            const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            // Check current state (prioritize settings.json -> environment)
            const currentState = settings.showImmuneMessage !== null 
                ? settings.showImmuneMessage 
                : (process.env.SHOW_IMMUNE_MESSAGE === 'true');
            const newState = !currentState;
            
            // Update settings
            settings.showImmuneMessage = newState;
            
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
            
            await interaction.reply({
                content: `${newState ? 'Đã bật' : 'Đã tắt'} hiển thị tin nhắn với người có quyền`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error toggling immune message:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi thay đổi cài đặt.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
