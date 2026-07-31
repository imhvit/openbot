import { config } from '@/config';
import chalk from 'chalk';
import type { ExtendedClient } from '@/structure/client';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

async function loadPrefixCommands(client: ExtendedClient, commandsPath: string) {
  const folders = readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );

    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      const fileUrl = pathToFileURL(filePath).href;
      const imported = await import(fileUrl);

      const command = imported.default || imported;

      if ('name' in command && 'execute' in command) {
        client.prefixCommands.set(command.name, command);
        console.log(
          chalk.magenta(`[PREFIX] `) +
            chalk.gray(`Comando cargado: ${config.prefix}${command.name}`),
        );
      }
    }
  }
}

export async function loadCommands(client: ExtendedClient) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const prefixCommands = join(__dirname, '..', 'commands', 'prefix');
  await loadPrefixCommands(client, prefixCommands);
}
