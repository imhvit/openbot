import { config } from '@/config';
import type { SlashCommand } from '@/types/command';
import {
  ActionRowBuilder,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('help')
    .setDescription('Muestra un menú de ayuda'),
  execute: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Panel de Ayuda')
      .setDescription('Aquí tienes una lista de comandos disponibles.')
      .setColor(config.colors?.primary ?? null);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-select-menu')
      .setPlaceholder('Comandos de OpenBot')
      .addOptions([
        {
          label: 'Inicio',
          value: 'help-option-1',
        },
        {
          label: 'Información',
          description: 'Información del bot',
          value: 'help-option-2',
        },
        {
          label: 'Comandos',
          description: 'Comandos disponibles',
          value: 'help-option-3',
        },
        {
          label: 'Configuración',
          description: 'Comandos de configuración',
          value: 'help-option-4',
        },
      ]);

    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [actionRow] });
  },
} as SlashCommand;
