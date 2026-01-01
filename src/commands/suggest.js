const { EmbedBuilder, SlashCommandBuilder, TextDisplayBuilder, LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Embed } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Help with the development of the bot by suggesting improvements.'),
    async execute (interaction) {
        const modal = new ModalBuilder()
            .setCustomId('suggestion')
            .setTitle('Suggest Improvements');
        
        const input = new TextInputBuilder()
            .setCustomId('suggestion-input')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Type here...')
            .setMaxLength(1_000)
            .setRequired(true);

        const label = new LabelBuilder()
            .setLabel('Enter Your Suggestion')
            .setTextInputComponent(input);

        const text = new TextDisplayBuilder().setContent(
            'If you have any suggestions or improvements that you would like to see in the bot, please let us know!\n\nYou can suggest new features, improvements to existing features, report bugs, or any other ideas you have to make the bot better.'
        )

        modal.addTextDisplayComponents(text);
        modal.addLabelComponents(label);
        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === interaction.user.id,
        }).catch(error => {
            // console.error(error.reason)
            return;
        });
        if (submitted) {
            let embed = new EmbedBuilder()
                .setDescription("_Thank you for contributing to the development of the bot!_\nYour suggestion has been received and will be reviewed by the development team.")
                .setColor(interaction.client.embedColor())
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            await submitted.reply({ embeds: [embed] });

            const chnl = await interaction.client.channels.fetch(process.env.SUGGESTION_CHANNEL_ID)
            const emb = new EmbedBuilder()
                .setColor(interaction.client.embedColor())
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(submitted.fields.getTextInputValue('suggestion-input'))
            try {
                await chnl.send({ 
                    content: `> New suggestion from <@${interaction.user.id}> (ID: _${interaction.user.id}_)\n> Server: **${interaction.guild.name}** (ID: _${interaction.guild.id}_)`,
                    embeds: [emb]
                });
            } catch (error) {
                await chnl.send({ 
                    content: `> New suggestion from <@${interaction.user.id}> (ID: _${interaction.user.id}_)\n> Server: **???** (ID: _???_)`,
                    embeds: [emb]
                });
            }
        }
    }
}