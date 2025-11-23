require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const randomQuote = require('./functions/randomQuote');
const randomAntiQuote = require('./functions/randomAntiQuote');
const randomTime = require('./functions/randomTime');
const { incrementTimeout } = require('./functions/leaderboard');
const createTimeoutEmbed = require('./return/default');
const createImmunityEmbed = require('./return/immunity');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Register slash commands
async function registerCommands() {
    const commands = [];
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        commands.push(command.data.toJSON());
    }

    const rest = new REST().setToken(process.env.BOT_TOKEN);

    try {
        console.log(`Registering ${commands.length} slash commands...`);

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Registration complete.');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
}

// Bot ready event
client.once('clientReady', async () => {
    console.log(`${client.user.tag} ready!`);
    await registerCommands();
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Chỉ xử lý commands trong guild đã chỉ định
    if (interaction.guildId !== process.env.GUILD_ID) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        const replyOptions = {
            content: 'An error occurred while executing the command!',
            flags: MessageFlags.Ephemeral
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
});

// Handle messages for random timeout
client.on('messageCreate', async message => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Ignore messages without content
    if (!message.content) return;

    // Chỉ hoạt động trong guild đã chỉ định
    if (!message.guild || message.guild.id !== process.env.GUILD_ID) return;

    // Get config from settings.json (priority) or environment (fallback)
    let rate, minTime, maxTime, showImmuneMessage, whitelistChannels, whitelistRoles, whitelistCategories;
    try {
        const settingsPath = path.join(__dirname, 'data', 'settings.json');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        
        rate = settings.rate !== null ? settings.rate : (parseFloat(process.env.RATE) || 0.1);
        minTime = settings.minTime !== null ? settings.minTime : (parseInt(process.env.MIN_TIME) || 60);
        maxTime = settings.maxTime !== null ? settings.maxTime : (parseInt(process.env.MAX_TIME) || 120);
        showImmuneMessage = settings.showImmuneMessage !== null ? settings.showImmuneMessage : (process.env.SHOW_IMMUNE_MESSAGE === 'true');
        whitelistChannels = settings.whitelistChannels || [];
        whitelistRoles = settings.whitelistRoles || [];
        whitelistCategories = settings.whitelistCategories || [];
    } catch (error) {
        // Fallback to env if settings.json fails
        rate = parseFloat(process.env.RATE) || 0.1;
        minTime = parseInt(process.env.MIN_TIME) || 60;
        maxTime = parseInt(process.env.MAX_TIME) || 120;
        showImmuneMessage = process.env.SHOW_IMMUNE_MESSAGE === 'true';
        whitelistChannels = [];
        whitelistRoles = [];
        whitelistCategories = [];
    }
    
    // Check if channel is whitelisted
    if (whitelistChannels.includes(message.channel.id)) return;
    
    // Check if channel's parent category is whitelisted
    if (message.channel.parentId && whitelistCategories.includes(message.channel.parentId)) return;
    
    // Check if user has a whitelisted role
    if (message.member && whitelistRoles.some(roleId => message.member.roles.cache.has(roleId))) return;

    // Random chance to timeout (rate is in percentage, random is 0-100)
    const random = Math.random() * 100;
    
    console.log(`Rate: ${rate}%, Random: ${random.toFixed(2)}, Will timeout: ${random < rate}`);
    
    if (random < rate) {
        try {
            const member = message.member;
            
            // Check if user is moderatable (can be timed out)
            if (member && member.moderatable) {
                // Get random timeout duration
                const timeoutDuration = randomTime(minTime, maxTime);
                
                // Get random quote and replace placeholders
                const quote = randomQuote()
                    .replace(/\$\{username\}/g, `<@${message.author.id}>`)
                    .replace(/\$\{time\}/g, timeoutDuration);

                // Timeout the user
                await member.timeout(timeoutDuration * 1000, 'Random timeout từ Celestia bot');
                
                // Increment leaderboard count with duration
                incrementTimeout(message.author.id, message.author.tag, timeoutDuration);
                
                // Format and send timeout message
                const formattedMessage = createTimeoutEmbed(quote);
                await message.channel.send(formattedMessage);
                
                console.log(`Timeout ${message.author.tag} for ${timeoutDuration}s`);
            } else {
                // User has permission immunity (not moderatable)
                if (showImmuneMessage) {
                    // Determine immunity type
                    let immuneType = 'permission immune';
                    
                    // Check if user has higher role than bot
                    const botMember = message.guild.members.me;
                    if (member && botMember && member.roles.highest.position > botMember.roles.highest.position) {
                        immuneType = 'role higher';
                    }
                    
                    // Get random anti-quote and replace placeholders
                    const antiQuote = randomAntiQuote()
                        .replace(/\$\{username\}/g, `<@${message.author.id}>`)
                        .replace(/\$\{immune_type\}/g, immuneType);
                    
                    // Format and send immunity message
                    const formattedMessage = createImmunityEmbed(antiQuote);
                    await message.channel.send(formattedMessage);
                    
                    console.log(`${message.author.tag} has immunity (${immuneType})`);
                } else {
                    console.log(`${message.author.tag} has immunity (message hidden)`);
                }
            }
        } catch (error) {
            console.error('Error timing out user:', error);
        }
    }
});

// Login to Discord
client.login(process.env.BOT_TOKEN);
