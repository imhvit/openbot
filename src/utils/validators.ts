import { Collection, GuildMember, PermissionsBitField } from 'discord.js';
import { config } from '@/config';

export const isDeveloper = (userId: string): boolean => {
  return config.developers.includes(userId);
};

export const getMissingPermissions = (
  member: GuildMember | null | undefined,
  requiredPermissions?: bigint[],
): string[] => {
  if (!member || !requiredPermissions) return [];
  const missing = requiredPermissions.filter((perm) => !member.permissions.has(perm));
  return missing.map((p) => new PermissionsBitField(p).toArray()[0]);
};

export const checkCooldown = (
  userId: string,
  commandName: string,
  cooldownSeconds: number,
  cooldownsCollection: Collection<string, Collection<string, number>>,
): number | null => {
  if (!cooldownsCollection.has(commandName)) {
    cooldownsCollection.set(commandName, new Collection());
  }

  const timestamps = cooldownsCollection.get(commandName)!;
  const now = Date.now();
  const cooldownAmount = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId)! + cooldownAmount;
    if (now < expirationTime) {
      return (expirationTime - now) / 1000;
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return null;
};
