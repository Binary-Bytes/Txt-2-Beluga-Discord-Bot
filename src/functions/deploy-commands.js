require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { TOKEN } = process.env;
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

module.exports = {
    async execute() {
        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            commands.push(command.data.toJSON());
        }
        
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        
        (async () => {
            try {
                console.log(`Started refreshing ${commands.length} application (/) commands.`);
        
                const data = await rest.put(
                    Routes.applicationCommands(process.env.USERID),
                    { body: commands },
                );
        
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                console.error(error);
            }
        })();
    }
}