import { config } from '@/config';
import type { ExtendedClient } from '@/structure/Client';
import type { LavaLinkNode } from '@/types/services';
import chalk from 'chalk';
import { Shoukaku, Connectors } from 'shoukaku';

export class LavalinkManager {
  public shoukaku: Shoukaku;

  constructor(client: ExtendedClient) {
    this.shoukaku = new Shoukaku(
      new Connectors.DiscordJS(client),
      config.lavalink as LavaLinkNode[],
    );

    this.setupEvents();
  }

  private setupEvents() {
    this.shoukaku.on('ready', (name) => {
      console.log(chalk.yellow(`[LAVALINK] `) + chalk.white(`Conectado: ${name}`));
    });

    this.shoukaku.on('error', (name, error) => {
      console.error(chalk.red(`[LAVALINK ERROR]`) + chalk.white(` Error en nodo ${name}:`), error);
    });

    this.shoukaku.on('close', (name, code, reason) => {
      console.log(
        chalk.yellow(`[LAVALINK] `) + chalk.white(`Nodo cerrado: ${name} (${code}) ${reason}`),
      );
    });
  }
}
