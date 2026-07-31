import { config } from '@/config';
import type { ExtendedClient } from '@/structure/Client';
import type { LavaLinkNode } from '@/types/services';
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
      console.log(`Lavalink conectado: ${name}`);
    });

    this.shoukaku.on('error', (name, error) => {
      console.error(`Error en nodo ${name}:`, error);
    });

    this.shoukaku.on('close', (name, code, reason) => {
      console.log(`Nodo cerrado: ${name} (${code}) ${reason}`);
    });
  }
}
