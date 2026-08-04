import type { ExtendedClient } from '@/structure/Client';
import chalk from 'chalk';
import { readdirSync } from 'fs';
import { join } from 'path';

export async function loadEvents(client: ExtendedClient) {
  const eventsPath = join(__dirname, '..', 'events');

  const eventFiles = readdirSync(eventsPath, { withFileTypes: true })
    .filter(
      (dirent) => dirent.isFile() && (dirent.name.endsWith('.ts') || dirent.name.endsWith('.js')),
    )
    .map((dirent) => dirent.name);

  const totalEvents = eventFiles.length;
  let loadedEvents = 0;

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const imported = require(filePath);
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

    loadedEvents++;
  }

  console.log(
    chalk.green(`[Events] `) + chalk.white(`Eventos cargados: ${loadedEvents}/${totalEvents}`),
  );
}
