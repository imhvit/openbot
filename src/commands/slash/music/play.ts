import type { ExtendedClient } from '@/structure/Client';
import type { SlashCommand } from '@/types/command';
import { buildTrackEmbed } from '@/utils/musicEmbeds';
import { GuildMember, MessageFlags, SlashCommandSubcommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('play')
    .setDescription('Reproduce una canción en el canal de voz')
    .addStringOption((option) =>
      option.setName('query').setDescription('Nombre de la canción o URL').setRequired(true),
    ),
  execute: async (interaction) => {
    const client = interaction.client as ExtendedClient;
    const query = interaction.options.getString('query', true);
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: 'Debes estar en un canal de voz para usar este comando.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const botVoiceChannelId = interaction.guild?.members.me?.voice.channelId;
    if (botVoiceChannelId && botVoiceChannelId !== voiceChannel.id) {
      await interaction.reply({
        content: 'Debes estar en el mismo canal de voz que el bot para usar este comando.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const node = client.lavalink.shoukaku.options.nodeResolver(client.lavalink.shoukaku.nodes);
      if (!node) throw new Error('No hay nodos de Lavalink disponibles.');

      const search = query.startsWith('http') ? query : `ytsearch:${query}`;
      const result = await node.rest.resolve(search);

      if (!result || result.loadType === 'empty' || result.loadType === 'error') {
        await interaction.editReply('No se encontraron resultados para tu búsqueda.');
        return;
      }

      const track =
        result.loadType === 'playlist'
          ? result.data.tracks[0]
          : result.loadType === 'search'
            ? result.data[0]
            : result.data;

      const queue = client.music.getQueue(interaction.guild!.id);
      queue.textChannel = interaction.channel;

      const isFirstTrack = queue.current === null;

      queue.add(track);

      if (!queue.player) {
        let player = client.lavalink.shoukaku.players.get(interaction.guild!.id);
        const currentBotVoiceChannel = interaction.guild?.members.me?.voice.channelId;

        if (player && !currentBotVoiceChannel) {
          await client.lavalink.shoukaku.leaveVoiceChannel(interaction.guild!.id);
          player = undefined;
        }

        if (!player) {
          player = await client.lavalink.shoukaku.joinVoiceChannel({
            guildId: interaction.guild!.id,
            channelId: voiceChannel.id,
            shardId: interaction.guild!.shardId,
            deaf: true,
          });
        }

        queue.connect(player);
      }

      if (!queue.current) {
        await queue.playNext(true);
      }

      const messageContent = isFirstTrack ? null : `Asignando a la posición \`#${queue.size}\``;

      const embedMusic = buildTrackEmbed(track, interaction.user, isFirstTrack);

      await interaction.editReply({
        content: messageContent,
        embeds: [embedMusic],
      });
    } catch (error) {
      console.error('Error al reproducir la canción:', error);
      await interaction.editReply({
        content: 'Ocurrió un error al intentar reproducir la canción.',
      });
    }
  },
} as SlashCommand;
