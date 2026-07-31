import type { PrefixCommand } from '@/types/command';

export default {
  name: 'ping',
  description: 'Responde con "Pong!"',
  execute: async (message, args) => {
    await message.reply('Pong!');
  },
} as PrefixCommand;
