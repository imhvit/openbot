import { syncGuilds } from '@/repositories/guild.repository';
import type { ExtendedClient } from '@/structure/Client';
import chalk from 'chalk';
import { Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: ExtendedClient) {
    console.log('[Ready] ' + chalk.white(`Conectado como ${client.user?.tag}!`));

    const currentGuilds = client.guilds.cache.map((guild) => ({
      guildId: guild.id,
      name: guild.name,
    }));

    try {
      await syncGuilds(currentGuilds);
      console.log(
        chalk.blue(`[DB Sync] `) +
          chalk.white(`Sincronizados ${currentGuilds.length} guilds exitosamente.`),
      );
    } catch (error) {
      console.error(
        chalk.red(`[DB Error] `) +
          chalk.white(`Fallo masivo al sincronizar guilds en el arranque:`),
        error,
      );
    }
  },
};
