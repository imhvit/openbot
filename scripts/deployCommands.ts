import { REST, Routes } from 'discord.js';
import { parseSlashCommands } from '@/handlers/commandHandler';
import { join } from 'node:path';
import chalk from 'chalk';
import { config } from '@/config';

export async function deployCommands() {
  const slashCommandsPath = join(__dirname, '..', 'src', 'commands', 'slash');

  const { restPayload } = await parseSlashCommands(slashCommandsPath);

  const rest = new REST().setToken(config.token);

  try {
    console.log(chalk.yellow('[Aviso] ') + chalk.white('Actualizando comandos slash...'));
    await rest.put(Routes.applicationCommands(config.clientId), {
      body: restPayload,
    });
    console.log(chalk.yellow('[Aviso] ') + chalk.white('Comandos slash actualizados'));
  } catch (error) {
    console.error(error);
  }
}

deployCommands();
