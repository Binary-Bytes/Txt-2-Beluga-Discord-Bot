const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, AttachmentBuilder, MessageFlags } = require('discord.js');
let fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sfx')
        .setDescription('Check and listen to the available sound effects.'),
    async execute (interaction) {
        await interaction.deferReply();
        
        let selection = new StringSelectMenuBuilder()
            .setCustomId('sound')
            .setPlaceholder('Select a sound to listen to it.')
            .setMinValues(1)
            .setMaxValues(1);

        const sounds = fs.readdirSync('src/t2b/assets/sounds/mp3');
        sounds.forEach((sound) => {
            sound = sound.replace('.mp3', '')
            selection.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(sound.charAt(0).toUpperCase() + sound.slice(1))
                    .setValue(sound)
            );
        });
        
        let row = new ActionRowBuilder()
            .addComponents(selection);
    
        let embed = new EmbedBuilder()
            .setTitle('Sound Effects')
            .setDescription(`> There are the pre-existing default sound effects available that can be used in your videos without any configurations for a better experience.\n> Select a sound to listen to it.`)
            .setColor(interaction.client.embedColor());

        let response = await interaction.editReply({
            embeds: [embed],
            components: [row],
            withResponse: true
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300_000 });

        collector.on('collect', async i => {
            const s = i.values[0];
            const attachment = new AttachmentBuilder(`src/t2b/assets/sounds/mp3/${s}.mp3`, { name: `${s}.mp3` });
            
            await i.update({
                files: [attachment]
            });
        });
    }
}