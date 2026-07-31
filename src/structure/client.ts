import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { config, type Config } from '@/config';
import type { PrefixCommand } from '@/types/command';
import { loadCommands } from '@/handlers/commandHandler';
import { loadEvents } from '@/handlers/eventHandler';

export class ExtendedClient extends Client {
  public prefixCommands: Collection<string, PrefixCommand>;
  public cooldowns: Collection<string, Collection<string, number>>;
  public config: Config;
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
      ],
    });

    this.prefixCommands = new Collection();
    this.cooldowns = new Collection();
    this.config = config;
  }

  public async init() {
    this.login(this.config.token);

    await loadCommands(this);
    await loadEvents(this);

    process.on('unhandledRejection', (error: Error) => {
      console.error('Unhandled promise rejection:', error);
    });
  }
}
