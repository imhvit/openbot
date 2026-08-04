import type { ComponentInteraction } from '@/types/component';
import { EmbedBuilder } from 'discord.js';

export default {
  data: {
    customId: 'help-select-menu',
  },
  async execute(interaction, client) {
    if (!interaction.isStringSelectMenu()) return;
    console.log(interaction.message.channel.id);

    const embed = EmbedBuilder.from(interaction.message.embeds[0]).setTitle(
      `Opción: ${interaction.values[0].split('-')[2]}`,
    );

    switch (interaction.values[0]) {
      case 'help-option-1':
        await interaction.update({ embeds: [embed] });
        break;
      case 'help-option-2':
        await interaction.update({ embeds: [embed] });
        break;
      case 'help-option-3':
        await interaction.update({ embeds: [embed] });
        break;
      case 'help-option-4':
        await interaction.update({ embeds: [embed] });
        break;
      default:
        await interaction.update({ embeds: [embed] });
    }
  },
} satisfies ComponentInteraction;
