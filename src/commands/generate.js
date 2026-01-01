const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { spawn } = require('child_process');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Geenerate a Beluga-like video within seconds.')
        .addAttachmentOption((option) => option
			.setRequired(true)
			.setName('file')
			.setDescription('Upload a chat script file (.txt)')
		),
    async execute (interaction) {
        await interaction.deferReply();

        if (!interaction.options.getAttachment('file').name.endsWith('.txt')) {
			const failedEmbed = new EmbedBuilder()
				.setColor(interaction.client.embedColor())
				.setDescription('The chat file must be a text file (`.txt`)');

			interaction.editReply({
				embeds: [failedEmbed]
			});
		} else {
            let emb = new EmbedBuilder()
                .setColor(interaction.client.embedColor())
                .setDescription('Working...');

            interaction.editReply({
                embeds: [emb]
            });

            let vid_id = genId(15)
            try {
                await runPythonScript(
                    'src/t2b/scripts/generate_chat.py',
                    [interaction.options.getAttachment('file').url, vid_id]
                );
            } catch(error) {
                // console.error('Python error:', error);
                
                const failedEmbed = new EmbedBuilder()
                    .setColor(interaction.client.embedColor())
                    .setDescription('Error generating video.\nCheck your script format and try again.');
                return interaction.editReply({ embeds: [failedEmbed] });
            };

            const video = new AttachmentBuilder(`${vid_id}/${vid_id}.mp4`, { name: `${vid_id}.mp4` } );
            const embed = new EmbedBuilder()
                .setColor(interaction.client.embedColor())
                .setDescription('-# Click on the download button to download the video.');
            await interaction.editReply({ files: [video], embeds: [embed] });

            setTimeout(() => {
                deleteFolderRecursive(vid_id);
            }, 300000);
        }
    }
}

async function runPythonScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [scriptPath].concat(args));
        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                // console.error(`Python script error:\n${stderrData}`);
                reject(new Error(`Script exited with code ${code}`));
            } else {
                // console.log(`Python output:\n${stdoutData}`);
                resolve(stdoutData);
            }
        });
    });
}

function genId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach((file) => {
			const curPath = `${path}/${file}`;
			if (fs.lstatSync(curPath).isDirectory()) {
				// Recursively delete subdirectories
				deleteFolderRecursive(curPath);
			} else {
				// Delete file
				fs.unlinkSync(curPath);
			}
		});

		// Delete the empty directory
		fs.rmdirSync(path);
	}
}