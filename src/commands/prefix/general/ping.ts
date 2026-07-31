import type { PrefixCommand } from '@/types/command';
export default {
  name: 'ping',
  description: 'Responde con "Pong!"',
  cooldown: 5,
  execute: async (message, args) => {
    await message.reply('pong');
  },
} as PrefixCommand;
