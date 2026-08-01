import type { ExtendedClient } from '@/structure/Client';
import chalk from 'chalk';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export async function loadEvents(client: ExtendedClient) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const eventsPath = join(__dirname, '..', 'events');

  const eventFiles = readdirSync(eventsPath, { withFileTypes: true })
    .filter(
      (dirent) => dirent.isFile() && (dirent.name.endsWith('.ts') || dirent.name.endsWith('.js')),
    )
    .map((dirent) => dirent.name);

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    const imported = await import(fileUrl);

    const event = imported.default || imported;

    if (!event.name || typeof event.execute !== 'function') {
      console.warn(
        chalk.yellow(`[WARNING] `) +
          chalk.white(`El archivo ${file} no exporta un evento válido. Ignorando.`),
      );
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(chalk.green(`[EVENT] `) + chalk.white(`Evento cargado: ${event.name}`));
  }
}
