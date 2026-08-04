import { config } from '@/config';
import { handlePrefixCommand } from '@/handlers/prefixDispatcher';
import { musicRequestProcessor } from '@/modules/music/musicRequestProcessor';
import type { ExtendedClient } from '@/structure/Client';
import type { MessageProcessor } from '@/types/processor';
import { Events, Message } from 'discord.js';

const processors = [musicRequestProcessor];

export default {
  name: Events.MessageCreate,
  async execute(message: Message, client: ExtendedClient) {
    if (message.author.bot || !message.guild) return;

    for (const processor of processors) {
      const shouldContinue = await processor(message, client);
      if (!shouldContinue) return;
    }

    if (message.content.startsWith(config.prefix)) {
      await handlePrefixCommand(message, client);
    }
  },
};
