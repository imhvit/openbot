import { db } from '@/lib/db';
import { guildSettingsTable, guildsTable } from '@/db/schemas/guild';
import { eq, sql } from 'drizzle-orm';

export async function saveGuild(guildId: string, name: string) {
  return db
    .insert(guildsTable)
    .values({ guildId, name })
    .onConflictDoUpdate({ target: guildsTable.guildId, set: { name, deletedAt: null } });
}

export async function syncGuilds(guilds: { guildId: string; name: string }[]) {
  if (guilds.length === 0) return;

  const CHUNK_SIZE = 1000;

  for (let i = 0; i < guilds.length; i += CHUNK_SIZE) {
    const chunk = guilds.slice(i, i + CHUNK_SIZE);

    await db
      .insert(guildsTable)
      .values(chunk)
      .onConflictDoUpdate({
        target: guildsTable.guildId,
        set: {
          name: sql`excluded.name`,
          deletedAt: null,
        },
      });
  }
}

export async function upsertMusicPanelChannel(
  guild: { guildId: string; name: string },
  incomingChannelId: string,
): Promise<void> {
  const [existingGuild] = await db
    .select({ id: guildsTable.id })
    .from(guildsTable)
    .where(eq(guildsTable.guildId, guild.guildId));

  if (!existingGuild) {
    const [newGuild] = await db
      .insert(guildsTable)
      .values({ guildId: guild.guildId, name: guild.name })
      .returning({ id: guildsTable.id });

    await db
      .insert(guildSettingsTable)
      .values({ guildId: newGuild.id, musicChannelId: incomingChannelId });

    return;
  }

  await db
    .insert(guildSettingsTable)
    .values({ guildId: existingGuild.id, musicChannelId: incomingChannelId })
    .onConflictDoUpdate({
      target: guildSettingsTable.guildId,
      set: { musicChannelId: incomingChannelId },
    });
}
