const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settime')
        .setDescription('Thay đổi thời gian timeout tối thiểu và tối đa')
        .addIntegerOption(option =>
            option.setName('min')
                .setDescription('Thời gian tối thiểu (giây)')
                .setRequired(true)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('Thời gian tối đa (giây)')
                .setRequired(true)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const minTime = interaction.options.getInteger('min');
        const maxTime = interaction.options.getInteger('max');
        
        if (minTime > maxTime) {
            await interaction.reply({
                content: 'Thời gian tối thiểu không được lớn hơn thời gian tối đa!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        
        try {
            const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            settings.minTime = minTime;
            settings.maxTime = maxTime;
            
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
            
            await interaction.reply({
                content: `Đã thay đổi thời gian timeout:\n- Tối thiểu: ${minTime}s\n- Tối đa: ${maxTime}s`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error setting time:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi thay đổi thời gian.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
