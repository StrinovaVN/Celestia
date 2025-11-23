const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolewhitelist')
        .setDescription('Quản lý role whitelist')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Thêm vai trò vào whitelist')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Vai trò cần thêm')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Xóa vai trò khỏi whitelist')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Vai trò cần xóa')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Xem danh sách vai trò whitelist'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        try {
            const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            if (!settings.whitelistRoles) {
                settings.whitelistRoles = [];
            }
            
            const subcommand = interaction.options.getSubcommand();
            
            if (subcommand === 'add') {
                const role = interaction.options.getRole('role');
                
                if (settings.whitelistRoles.includes(role.id)) {
                    await interaction.reply({
                        content: `<@&${role.id}> đã có whitelist!`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                settings.whitelistRoles.push(role.id);
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
                
                await interaction.reply({
                    content: `Đã thêm <@&${role.id}> vào whitelist!`,
                    flags: MessageFlags.Ephemeral
                });
                
            } else if (subcommand === 'remove') {
                const role = interaction.options.getRole('role');
                
                const index = settings.whitelistRoles.indexOf(role.id);
                if (index === -1) {
                    await interaction.reply({
                        content: `<@&${role.id}> không có trong whitelist!`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                settings.whitelistRoles.splice(index, 1);
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
                
                await interaction.reply({
                    content: `Đã xóa <@&${role.id}> khỏi whitelist!`,
                    flags: MessageFlags.Ephemeral
                });
                
            } else if (subcommand === 'list') {
                if (settings.whitelistRoles.length === 0) {
                    await interaction.reply({
                        content: 'Chưa có role nào trong whitelist!',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                
                const roleList = settings.whitelistRoles
                    .map(id => `<@&${id}>`)
                    .join('\n');
                
                await interaction.reply({
                    content: `**Danh sách whitelist:**\n${roleList}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error('Error managing role whitelist:', error);
            await interaction.reply({
                content: 'Có lỗi xảy ra khi quản lý whitelist.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};