require('dotenv').config();

const express = require('express');
const fs = require('node:fs');
// const { QuickDB } = require("quick.db");
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const TOKEN = process.env.TOKEN;

// 24/7   24/7   24/7

const app = express();

app.get('/', (req, res) => {
	res.send('letss goooo!')
});

app.listen(3000, () => {
	console.log('server started');
});

// 24/7   24/7   24/7

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.embedColor = () => {
	let colors = ['#99ffb4', '#cfa6ff', '#ffb0e1', '#ffc973', '#926eff']
	return colors[Math.floor(Math.random() * colors.length)];
}

client.quickEmbed = (interaction, content, color) => {
    let embed = new EmbedBuilder()
        .setDescription(content)
        .setColor(color)
        
    return interaction.reply({ embeds: [embed] });
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// // DATABASE  DATABASE  DATABASE

// const db = new QuickDB({ filePath: './data/db.json' });

// /*
// 	"user_id": {
// 		"character_name": {
// 			"picture": "url",
// 			"colour": "#hex"
// 		}
// 	}
// */

// client.db = db;

// // DATABASE  DATABASE  DATABASE

client.login(TOKEN);