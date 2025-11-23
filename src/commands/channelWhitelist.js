const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channelwhitelist')
        .setDescription('Quản lý channel whitelist')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Thêm kênh vào whitelist')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Kênh cần thêm')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Xóa kênh khỏi whitelist')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Kênh cần xóa')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Xem danh sách kênh whitelist'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        try {
            const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            if (!settings.whitelistChannels) {
                settings.whitelistChannels = [];
            }
            
            const subcommand = interaction.options.getSubcommand();
            
            if (subcommand === 'add') {
                const channel = interaction.options.getChannel('channel');
                
                if (settings.whitelistChannels.includes(channel.id)) {
                    await interaction.reply({
                        content: `<#${channel.id}> đã có trong whitelist!`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                settings.whitelistChannels.push(channel.id);
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
                
                await interaction.reply({
                    content: `Đã thêm <#${channel.id}> vào whitelist!`,
                    flags: MessageFlags.Ephemeral
                });
                
            } else if (subcommand === 'remove') {
                const channel = interaction.options.getChannel('channel');
                
                const index = settings.whitelistChannels.indexOf(channel.id);
                if (index === -1) {
                    await interaction.reply({
                        content: `<#${channel.id}> không có trong whitelist!`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                settings.whitelistChannels.splice(index, 1);
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
                
                await interaction.reply({
                    content: `Đã xóa <#${channel.id}> khỏi whitelist!`,
                    flags: MessageFlags.Ephemeral
                });
                
            } else if (subcommand === 'list') {
                if (settings.whitelistChannels.length === 0) {
                    await interaction.reply({
                        content: 'Chưa có channel nào trong whitelist!',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                const channelList = settings.whitelistChannels
                    .map(id => `<#${id}>`)
                    .join('\n');
                
                await interaction.reply({
                    content: `**Danh sách whitelist:**\n${channelList}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error('Error managing channel whitelist:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi quản lý whitelist.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};