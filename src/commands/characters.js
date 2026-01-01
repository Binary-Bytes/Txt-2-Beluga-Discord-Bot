const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, AttachmentBuilder, MessageFlags } = require('discord.js');
let fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('characters')
        .setDescription('View, Add, Update or Delete your characters. [In Work]')
        .addStringOption(option => (
            option.setName('type')
                .setDescription('Choose the type of characters to view.')
                .setRequired(true)
                .addChoices(
                    { name: 'Default', value: 'default' },
                    { name: 'Custom', value: 'custom' }
                )
        )),
    async execute (interaction) {
        await interaction.deferReply();
        const type = interaction.options.getString('type');
        
        if (type === 'default') {
            let defaultCharacters = JSON.parse(fs.readFileSync('src/t2b/assets/profile_pictures/characters.json', 'utf8'));
            let selection = new StringSelectMenuBuilder()
                .setCustomId('characters')
                .setPlaceholder('Select a character to view more about it.')
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(Object.entries(defaultCharacters).map(([key, value]) => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(key)
                        .setValue(key)
                }));

            let actionRow = new ActionRowBuilder()
                .addComponents(selection);
            
            let embed = new EmbedBuilder()
                .setTitle('Default Characters')
                .setDescription(`> These are the pre-existing default characters that can be used in your scripts without any configurations. Select a character to view more about it, and a sample generated message. These are:\n\n${Object.keys(defaultCharacters).map((character, index) => `**${index + 1}.** _${character}_`).join('\n')}`)
                .setColor(interaction.client.embedColor());
    
            let response = await interaction.editReply({
                embeds: [embed],
                components: [actionRow],
                withResponse: true
            });

            const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300_000 });

            collector.on('collect', async i => {
                const selection = i.values[0];
                const selectedCharacter = defaultCharacters[selection];
                const profilePicPath = `src/t2b/assets/profile_pictures/${selectedCharacter.profile_pic}`;
                
                const attachment = new AttachmentBuilder(profilePicPath, { name: `${selection.toLowerCase()}_pfp.png` });
                const description = new AttachmentBuilder(`assets/descriptions/${selection.toLowerCase()}.png`, { name: `${selection.toLowerCase()}.png` } );
                
                const characterEmbed = new EmbedBuilder()
                    .setTitle(selection)
                    .setDescription(`> ${selectedCharacter.description}\n> \n> **Role Colour**\n> ${selectedCharacter.role_color}`)
                    .setColor(selectedCharacter.role_color)
                    .setThumbnail(`attachment://${attachment.name}`)
                    .setImage(`attachment://${description.name}`)
                    .setFooter({ text: 'Sample generated text message.' });
                
                await i.update({
                    embeds: [characterEmbed],
                    files: [attachment, description]
                });
            });
        }

        if (type === 'custom') {
            /*// Custom characters code goes here
            let db = interaction.client.db;
            await db.set(interaction.user.id, {
                "character1": {
                    "picture": "url",
                    "colour": "#hex"
                },
                "character2": {
                    "picture": "https://github.com/",
                    "colour": "#hex"
                },
                "character3": {
                    "picture": "url",
                    "colour": "#hex"
                },
                "character4": {
                    "picture": "https://github.com/",
                    "colour": "#hex"
                },
                "character5": {
                    "picture": "url",
                    "colour": "#hex"
                },
                "character6": {
                    "picture": "https://github.com/",
                    "colour": "#hex"
                }
            });
            let data = await db.get(interaction.user.id);
            console.log(data);
            if (!data) {
                let embed = new EmbedBuilder()
                    .setDescription('You have no custom characters yet.')
                    .setColor(interaction.client.embedColor())
                return interaction.editReply({ embeds: [embed] });
            }*/

            let embed = new EmbedBuilder()
                .setDescription('*This command, and more features are __in work__ at the moment.*\nFeel free to suggest improvements, report bugs or share your feedback with us in the meantime through the </suggest:1454779516885930016> command!')
                .setColor(interaction.client.embedColor())
            return interaction.editReply({ embeds: [embed] });
        }
    }
}