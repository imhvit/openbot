import type { TextBasedChannel, TextChannel } from 'discord.js';
import type { Player, Track } from 'shoukaku';

export class GuildQueue {
  private tracks: Track[] = [];
  public current: Track | null = null;
  public player: Player | null = null;
  public textChannel: TextBasedChannel | null = null;

  constructor(
    public readonly guildId: string,
    private readonly onDestroy: (guildId: string) => void,
  ) {}

  public add(track: Track): void {
    this.tracks.push(track);
  }

  public connect(player: Player): void {
    this.player = player;

    this.player.on('end', (data) => {
      if (data.reason === 'replaced' || data.reason === 'stopped') return;
      this.playNext();
    });

    this.player.on('closed', () => {
      this.destroy();
    });

    this.player.on('exception', (data) => {
      console.error(`[Lavalink Exception] Guild ${this.guildId}:`, data.exception);
      this.playNext();
    });

    this.player.on('stuck', () => {
      console.warn(`[Lavalink Stuck] Guild ${this.guildId}: Track atascado, saltando...`);
      this.playNext();
    });
  }

  public destroy(): void {
    this.clear();
    this.current = null;
    this.player = null;

    this.onDestroy(this.guildId);
  }

  public async playNext(silent: boolean = false): Promise<void> {
    if (!this.player) return;

    this.current = this.tracks.shift() ?? null;

    if (!this.current) {
      await this.player.stopTrack();
      return;
    }

    if (!silent && this.textChannel && 'send' in this.textChannel) {
      (this.textChannel as TextChannel)
        .send(
          `🎶 Reproduciendo ahora: **[${this.current.info.title}](<${this.current.info.uri}>)**`,
        )
        .catch((error: any) => {
          console.error(`[GuildQueue] Error enviando mensaje en el guild ${this.guildId}:`, error);
        });
    }

    await this.player.playTrack({ track: { encoded: this.current.encoded } });
  }

  public clear(): void {
    this.tracks = [];
  }

  public get size(): number {
    return this.tracks.length;
  }
  public get tracksList(): Track[] {
    return this.tracks;
  }
}
