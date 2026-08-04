import { saveGuild } from '@/repositories/guild.repository';
import chalk from 'chalk';
import { Events, Guild } from 'discord.js';

export default {
  name: Events.GuildCreate,
  async execute(guild: Guild) {
    try {
      await saveGuild(guild.id, guild.name);
    } catch (error) {
      console.error(
        chalk.red(`[DB Error]`) + chalk.white(` Fallo al registrar guild ${guild.id}:`),
        error,
      );
    }
  },
};
