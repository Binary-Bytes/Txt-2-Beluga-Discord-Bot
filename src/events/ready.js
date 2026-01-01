const { Events } = require('discord.js');
const deploy = require('../functions/deploy-commands');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
        deploy.execute();
        console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};