import type { SlashCommand } from '@/types/command';
import { SlashCommandSubcommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandSubcommandBuilder().setName('ping').setDescription('Responde con Pong!'),
  cooldown: 5,
  execute: async (interaction) => {
    await interaction.reply('Pong!');
  },
} as SlashCommand;
