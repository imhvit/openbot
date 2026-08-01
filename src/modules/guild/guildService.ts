import { db } from '@/db';
import { guildsTable } from './guildSchema';
import { sql } from 'drizzle-orm';

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
