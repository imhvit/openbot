import type { ExtendedClient } from '@/structure/Client';
import type { PrefixCommand } from '@/types/command';
import type { Message } from 'discord.js';

export default {
  name: 'play',
  description: 'Reproduce una canción en el canal de voz',
  async execute(message, args) {
    const client = message.client as ExtendedClient;
    const voiceChannel = message.member?.voice.channel;

    if (!voiceChannel) {
      await message.reply('Debes estar en un canal de voz para usar este comando.');
      return;
    }

    try {
      let player = client.lavalink.shoukaku.players.get(message.guild!.id);

      if (!player) {
        player = await client.lavalink.shoukaku.joinVoiceChannel({
          guildId: message.guild!.id,
          channelId: voiceChannel.id,
          shardId: message.guild!.shardId,
        });
      }

      const botVoiceChannelId = message.guild!.members.me?.voice.channelId;

      if (botVoiceChannelId && botVoiceChannelId !== voiceChannel.id) {
        await message.reply(
          'Debes estar en el mismo canal de voz que el bot para usar este comando.',
        );
        return;
      }

      const query = args.join(' ');
      const search = query.startsWith('http') ? query : `ytsearch:${query}`;

      const result = await player.node.rest.resolve(search);

      if (!result || result.loadType === 'empty' || result.loadType === 'error') {
        await message.reply('No se encontraron resultados para tu búsqueda.');
        return;
      }

      const track =
        result.loadType === 'playlist'
          ? result.data.tracks[0]
          : result.loadType === 'search'
            ? result.data[0]
            : result.data;

      if (!track) {
        await message.reply('No se pudo procesar la pista de audio.');
        return;
      }

      await player.playTrack({ track: { encoded: track.encoded } });
      console.log(track.info);
      await message.reply(`🎵 Reproduciendo: **${track.info.title}**`);
    } catch (error) {
      console.error('Error gestionando la conexión de voz:', error);
      await message.reply('Hubo un error crítico al interactuar con el nodo de música.');
    }
  },
} satisfies PrefixCommand;
