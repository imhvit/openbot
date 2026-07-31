import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { config, type Config } from '@/config';
import type { PrefixCommand, SlashCommand, SubcommandGroup } from '@/types/command';
import { loadCommands } from '@/handlers/commandHandler';
import { loadEvents } from '@/handlers/eventHandler';
import { LavalinkManager } from '@/manager/LavalinkManager';

export class ExtendedClient extends Client {
  public slashCommands: Collection<string, SlashCommand | SubcommandGroup>;
  public prefixCommands: Collection<string, PrefixCommand>;
  public cooldowns: Collection<string, Collection<string, number>>;
  public config: Config;
  public lavalink: LavalinkManager;
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    this.slashCommands = new Collection();
    this.prefixCommands = new Collection();
    this.cooldowns = new Collection();
    this.config = config;

    this.lavalink = new LavalinkManager(this);
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
