const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
            interaction.client.quickEmbed(interaction, `No command matching ${interaction.commandName} was found.`, interaction.client.embedColor());
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
            await command.execute(interaction);
		} catch (error) {
            interaction.client.quickEmbed(interaction, `There was an error executing "\`${interaction.commandName}\`".`, interaction.client.embedColor());
			console.error(`Error executing ${interaction.commandName}.`);
			console.error(error);
		}
	},
};