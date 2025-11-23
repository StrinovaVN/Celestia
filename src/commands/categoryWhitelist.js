const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('categorywhitelist')
        .setDescription('Quản lý category whitelist không bị timeout')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Thêm category whitelist')
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Category cần thêm')
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Xóa category whitelist')
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Category cần xóa')
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Xem danh sách whitelist'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        try {
            const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            if (!settings.whitelistCategories) {
                settings.whitelistCategories = [];
            }
            
            const subcommand = interaction.options.getSubcommand();
            
            if (subcommand === 'add') {
                const category = interaction.options.getChannel('category');
                
                if (settings.whitelistCategories.includes(category.id)) {
                    await interaction.reply({
                        content: `**${category.name}** đã có trong whitelist!`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                settings.whitelistCategories.push(category.id);
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
                
                await interaction.reply({
                    content: `Đã thêm **${category.name}** vào whitelist!`,
                    flags: MessageFlags.Ephemeral
                });
                
            } else if (subcommand === 'remove') {
                const category = interaction.options.getChannel('category');
                
                const index = settings.whitelistCategories.indexOf(category.id);
                if (index === -1) {
                    await interaction.reply({
                        content: `**${category.name}** không có trong whitelist!`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                settings.whitelistCategories.splice(index, 1);
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
                
                await interaction.reply({
                    content: `Đã xóa **${category.name}** khỏi whitelist!`,
                    flags: MessageFlags.Ephemeral
                });
                
            } else if (subcommand === 'list') {
                if (settings.whitelistCategories.length === 0) {
                    await interaction.reply({
                        content: 'Chưa có category nào trong whitelist!',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                const categoryList = settings.whitelistCategories
                    .map(id => {
                        const cat = interaction.guild.channels.cache.get(id);
                        return cat ? `**${cat.name}**` : `~~Unknown (${id})~~`;
                    })
                    .join('\n');
                
                await interaction.reply({
                    content: `**Danh sách whitelist:**\n${categoryList}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error('Error managing category whitelist:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi quản lý whitelist.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
