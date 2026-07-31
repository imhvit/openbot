import { GuildQueue } from './GuildQueue';

export class MusicManager {
  private static instance: MusicManager;
  private queues = new Map<string, GuildQueue>();

  private constructor() {
    this.queues = new Map<string, GuildQueue>();
  }

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

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
