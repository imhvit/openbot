import { Message } from 'discord.js';
import { ExtendedClient } from '@/structure/Client';

/**
 * Retorna `false` para abortar el pipeline (ej. mensaje eliminado por spam).
 * Retorna `true` o `void` para permitir que el siguiente procesador se ejecute.
 */
export type MessageProcessor = (
  message: Message,
  client: ExtendedClient,
) => Promise<boolean | void>;
