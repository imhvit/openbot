import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const guildsTable = pgTable('guilds', {
  id: uuid('id').defaultRandom().primaryKey(),
  guildId: text('guild_id').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const guildSettingsTable = pgTable('guild_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  guildId: uuid('guild_id')
    .notNull()
    .unique()
    .references(() => guildsTable.id, { onDelete: 'cascade' }),
  musicChannelId: text('music_channel_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const guildRelations = relations(guildsTable, ({ one }) => ({
  settings: one(guildSettingsTable),
}));

export const guildSettingsRelations = relations(guildSettingsTable, ({ one }) => ({
  guild: one(guildsTable, {
    fields: [guildSettingsTable.guildId],
    references: [guildsTable.id],
  }),
}));

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
