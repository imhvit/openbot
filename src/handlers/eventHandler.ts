import type { ExtendedClient } from '@/structure/client';
import chalk from 'chalk';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export async function loadEvents(client: ExtendedClient) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const eventsPath = join(__dirname, '..', 'events');
  const eventFolders = readdirSync(eventsPath);

  for (const folder of eventFolders) {
    const folderPath = join(eventsPath, folder);
    const eventFiles = readdirSync(folderPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );

    for (const file of eventFiles) {
      const filePath = join(folderPath, file);
      const fileUrl = pathToFileURL(filePath).href;
      const imported = await import(fileUrl);

      const event = imported.default || imported;

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(chalk.green(`[EVENT] `) + chalk.gray(`Evento cargado: ${event.name}`));
    }
  }
}
