import type { ExtendedClient } from '@/structure/Client';
import type { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';

export type AnyComponentInteraction = MessageComponentInteraction | ModalSubmitInteraction;

interface ComponentInteractionData {
  customId: string;
}

export interface ComponentInteraction {
  data: ComponentInteractionData;
  execute: (interaction: AnyComponentInteraction, client: ExtendedClient) => Promise<void>;
}
