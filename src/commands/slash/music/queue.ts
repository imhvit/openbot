import { MusicManager } from '@/modules/music/MusicManager';
import type { SlashCommand } from '@/types/command';
import { buildQueueEmbed } from '@/utils/musicEmbeds';
import { SlashCommandSubcommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('queue')
    .setDescription('Muestra la cola de reproducción'),
  execute: async (interaction) => {
    await interaction.deferReply();

    const manager = MusicManager.getInstance();
    const queue = manager.getQueue(interaction.guild!.id);

    try {
      const embedQueue =
        queue.size > 0 ? buildQueueEmbed(queue.tracksList, interaction.user) : null;

      if (!embedQueue) {
        await interaction.editReply('La cola de reproducción está vacía.');
        return;
      }

      await interaction.editReply({ embeds: [embedQueue] });
    } catch (error) {
      console.error(
        `[Queue Command] Error mostrando la cola en el guild ${interaction.guild!.id}:`,
        error,
      );
      await interaction.editReply('Ocurrió un error al mostrar la cola de reproducción.');
    }
  },
} as SlashCommand;
