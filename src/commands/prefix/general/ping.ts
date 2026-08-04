import type { PrefixCommand } from '@/types/command';
export default {
  name: 'ping',
  description: 'Responde con "Pong!"',
  cooldown: 5,
  async execute(message, args) {
    await message.reply('pong');
  },
} satisfies PrefixCommand;
