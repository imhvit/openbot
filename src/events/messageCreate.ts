import { config } from '@/config';
import { handlePrefixCommand } from '@/handlers/prefixDispatcher';
import type { ExtendedClient } from '@/structure/Client';
import { Events, Message } from 'discord.js';

export default {
  name: Events.MessageCreate,
  async execute(message: Message, client: ExtendedClient) {
    if (message.author.bot || !message.guild) return;

    Promise.allSettled([]).catch(console.error);

    if (message.content.startsWith(config.prefix)) {
      await handlePrefixCommand(message, client);
    }
  },
};
