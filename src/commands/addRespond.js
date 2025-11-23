const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrespond')
        .setDescription('Thêm respond timeout mới')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Nội dung (dùng ${username} với người dùng bị timeout và ${time} thời gian timeout.)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const message = interaction.options.getString('message');
        
        try {
            const respondPath = path.join(__dirname, '..', 'data', 'respond.json');
            const data = JSON.parse(fs.readFileSync(respondPath, 'utf8'));
            
            // Get current quotes object
            const quotes = data[0];
            
            // Find the next available key
            const keys = Object.keys(quotes).map(k => parseInt(k));
            const nextKey = Math.max(...keys) + 1;
            
            // Add new quote
            quotes[nextKey.toString()] = message;
            
            // Save to file
            fs.writeFileSync(respondPath, JSON.stringify(data, null, 4), 'utf8');
            
            await interaction.reply({
                content: `Đã thêm respond mới:\n\`\`\`${message}\`\`\``,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error adding respond:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi thêm mới.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
