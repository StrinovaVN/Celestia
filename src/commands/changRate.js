const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changerate')
        .setDescription('Thay đổi tỉ lệ timeout')
        .addNumberOption(option =>
            option.setName('rate')
                .setDescription('Tỉ lệ timeout (0-100, ví dụ: 0.1 = 0.1%, 10 = 10%)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const newRate = interaction.options.getNumber('rate');
        
        try {
            const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            // Update rate in settings
            settings.rate = newRate;
            
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
            
            await interaction.reply({
                content: `Đã thay đổi tỉ lệ dính timeout thành ${newRate.toFixed(1)}%`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error changing rate:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi thay đổi tỉ lệ.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
