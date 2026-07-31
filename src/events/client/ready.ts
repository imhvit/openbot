import type { ExtendedClient } from '@/structure/Client';
import chalk from 'chalk';
import { Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: ExtendedClient) {
    console.log(chalk.green(`[READY] `) + chalk.white(`Conectado como ${client.user?.tag}!`));
  },
};
