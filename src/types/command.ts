import type {
  ChatInputCommandInteraction,
  Message,
  PermissionResolvable,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';

interface CommandBaseConfig {
  developer?: boolean;
  cooldown?: number;
  permissions?: {
    bot?: PermissionResolvable[];
    user?: PermissionResolvable[];
  };
}

interface BaseCommand {
  developer?: boolean;
  cooldown?: number;
  category?: string;
  permissions?: {
    bot?: PermissionResolvable[];
    user?: PermissionResolvable[];
  };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface SlashCommand extends BaseCommand {
  data: SlashCommandBuilder | SlashCommandSubcommandBuilder;
}

export interface PrefixCommand extends CommandBaseConfig {
  name: string;
  description: string;
  aliases?: string[];
  usage?: string;
  category?: string;
  execute: (message: Message, args: string[]) => Promise<void>;
}

export interface SubcommandGroup extends SlashCommand {
  isGroup: boolean;
  subcommands: Record<string, BaseCommand>;
}
