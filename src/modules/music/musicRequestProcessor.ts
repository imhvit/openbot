import type { MessageProcessor } from '@/types/processor';
import type { TextChannel } from 'discord.js';

export const musicRequestProcessor: MessageProcessor = async (message, client) => {
  const channel = message.guild?.channels.cache.get(message.channel.id) as TextChannel;
  if (channel && channel.id === '1533601107161645086') {
    message.delete().catch(() => null);
    console.error('La función se detuvo');
    return false;
  }
  console.log('La función continuó');
  return true;
};
