import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { PrefixCommand, SlashCommand, SubcommandGroup } from '@/types/command';
import type { ComponentInteraction } from '@/types/component';
import { loadCommands } from '@/handlers/commandHandler';
import { loadEvents } from '@/handlers/eventHandler';
import { loadComponents } from '@/handlers/componentHandler';
import { LavalinkManager } from '@/modules/music/LavalinkManager';
import { MusicManager } from '@/modules/music/MusicManager';
import { config, type Config } from '@/config';
import '@/lib/redis';

export class ExtendedClient extends Client {
  public slashCommands: Collection<string, SlashCommand | SubcommandGroup>;
  public prefixCommands: Collection<string, PrefixCommand>;
  public components: Collection<string, ComponentInteraction>;
  public cooldowns: Collection<string, Collection<string, number>>;
  public config: Config;
  public lavalink: LavalinkManager;
  public music: MusicManager;
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
    this.components = new Collection();
    this.cooldowns = new Collection();
    this.config = config;

    this.lavalink = new LavalinkManager(this);
    this.music = new MusicManager(this);
  }

  public async init() {
    await loadCommands(this);
    await loadEvents(this);
    await loadComponents(this);

    await this.login(this.config.token);
  }
}
