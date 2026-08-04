import type { ExtendedClient } from '@/structure/Client';
import { GuildQueue } from './GuildQueue';

export class MusicManager {
  private queues = new Map<string, GuildQueue>();

  constructor(public readonly client: ExtendedClient) {}

  public getQueue(guildId: string): GuildQueue {
    let queue = this.queues.get(guildId);

    if (!queue) {
      queue = new GuildQueue(guildId, (id) => this.deleteQueue(id));
      this.queues.set(guildId, queue);
    }

    return queue;
  }

  public getExistingQueue(guildId: string): GuildQueue | undefined {
    return this.queues.get(guildId);
  }

  public deleteQueue(guildId: string): boolean {
    return this.queues.delete(guildId);
  }
}
