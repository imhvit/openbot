import { EmbedBuilder, User } from 'discord.js';
import type { Track } from 'shoukaku';

export function buildTrackEmbed(
  track: Track,
  requester: User,
  isFirstTrack: boolean = false,
): EmbedBuilder {
  const thumbnail =
    track.info.artworkUrl ??
    (track.info.sourceName === 'youtube'
      ? `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`
      : null);

  const totalSeconds = Math.floor(track.info.length / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const duration = track.info.isStream ? 'En vivo' : `${minutes}:${seconds}`;

  return new EmbedBuilder()
    .setColor(track.info.sourceName === 'youtube' ? '#c3352e' : '#1ed760')
    .setAuthor({ name: isFirstTrack ? 'Reproduciendo ahora' : 'Añadido a la cola' })
    .setTitle(
      track.info.sourceName === 'youtube'
        ? `${track.info.title} <:youtubemusic_openbot:1532787694739132628>`
        : `${track.info.title} <:spotify_openbot:1532787696471244830>`,
    )
    .setURL(track.info.uri ?? null)
    .setThumbnail(thumbnail)
    .addFields([{ name: 'Duración', value: duration, inline: true }])
    .addFields([{ name: 'Origen', value: track.info.sourceName, inline: true }])
    .setFooter({
      text: `Pedido por: ${requester.username}`,
      iconURL: requester.displayAvatarURL(),
    })
    .setTimestamp(new Date());
}

export function buildQueueEmbed(queue: Track[], requester: User): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setAuthor({ name: 'Cola de reproducción' })
    .setDescription(`**${queue.length} canciones en cola**`)
    .setFooter({
      text: `Pedido por: ${requester.username}`,
      iconURL: requester.displayAvatarURL(),
    })
    .setTimestamp(new Date());
}
