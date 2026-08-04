import { config } from '@/config';
import { upsertMusicPanelChannel } from '@/repositories/guild.repository';
import type { SlashCommand } from '@/types/command';
import { EmbedBuilder, MessageFlags, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';

export default {
  data: new SlashCommandSubcommandBuilder().setName('panel').setDescription('Panel de música'),
  async execute(interaction) {
    const channel = interaction.guild?.channels.cache.get(interaction.channelId) as TextChannel;

    if (!channel || !channel.isTextBased()) {
      await interaction.reply({
        content: 'Este comando solo puede ser usado en un canal de texto.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await upsertMusicPanelChannel(
      { guildId: interaction.guildId as string, name: interaction.guild?.name as string },
      channel.id,
    );

    const firstEmbed = new EmbedBuilder()
      .setTitle('Lista de Reproducción')
      .setDescription('Actualmente hay 0 canciones en la lista de reproducción.')
      .setColor(config.colors?.primary ?? null);

    const secondEmbed = new EmbedBuilder()
      .setTitle('Panel de Música')
      .setDescription('Para reproducir música escribe el nombre de la canción en este canal.')
      .setImage('https://i.imgur.com/zHPzoVd.jpeg')
      .setColor(config.colors?.primary ?? null);

    await channel.send({ embeds: [firstEmbed, secondEmbed] });

    await interaction.reply({
      content: `El panel ha sido creado en <#${channel?.id}>`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies SlashCommand;
