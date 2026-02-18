const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    PermissionFlagsBits, 
    ChannelType 
} = require('discord.js');
const http = require('http');

/**
 * 🌐 WEB SERVER PER RENDER
 * Indispensabile per mantenere il bot attivo gratuitamente.
 */
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.write("Cry’s MM Service Online 🛡️");
    res.end();
}).listen(port);

/**
 * 🤖 CONFIGURAZIONE CLIENT
 */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- ⚙️ CONFIGURAZIONE ID (CAMBIA QUESTI) ---
const TOKEN = process.env.TOKEN; // Preso dalle impostazioni di Render
const OWNER_ID = '1447251452161687643'; // Incolla qui il TUO ID utente
const STAFF_ROLE_ID = '1447241483827806301'; 
const CATEGORY_ID = '1473756118693056606'; 

client.once('ready', () => {
    console.log(`🛡️ Cry’s MM Service è online come ${client.user.tag}`);
});

/**
 * 📝 COMANDO SETUP (!setup)
 */
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Solo l'Owner o gli Amministratori possono fare il setup
    if (message.content === '!setup') {
        if (message.author.id !== OWNER_ID && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Non hai i permessi per usare questo comando.");
        }

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Cry’s MM Service | Middleman Support')
            .setDescription(
                "Benvenuto nel servizio ufficiale di **Cry’s MM Service**.\n\n" +
                "Per aprire una pratica Middleman o richiedere assistenza,\n" +
                "clicca sul pulsante qui sotto.\n\n" +
                "✅ *Il nostro staff ti risponderà nel minor tempo possibile.*"
            )
            .setColor('#5865F2')
            .setFooter({ text: 'Sicurezza garantita da Cry’s MM Service' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('Apri Richiesta')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🛡️')
        );

        await message.delete();
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

/**
 * 🖱️ GESTIONE TICKET
 */
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        const channelName = `ticket-${interaction.user.username}`;
        
        try {
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: CATEGORY_ID,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ],
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle('📩 Richiesta Aperta')
                .setDescription(`Ciao ${interaction.user}, scrivi qui i dettagli del servizio richiesto.\nLo Staff <@&${STAFF_ROLE_ID}> arriverà a breve.`)
                .setColor('#2ecc71');

            const rowStaff = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Chiudi Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

            await channel.send({ content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, embeds: [welcomeEmbed], components: [rowStaff] });
            await interaction.reply({ content: `Hai aperto un ticket: ${channel}`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Errore durante la creazione del ticket. Controlla i permessi del bot.", ephemeral: true });
        }
    }

    if (interaction.customId === 'close_ticket') {
        // Solo l'Owner o lo Staff possono chiudere i ticket
        if (interaction.user.id !== OWNER_ID && !interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({ content: "❌ Non hai il permesso di chiudere questo ticket.", ephemeral: true });
        }
        
        await interaction.reply("🔒 Chiusura in corso...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(TOKEN);

