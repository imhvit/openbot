import chalk from 'chalk';
import type { ExtendedClient } from '@/structure/Client';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand, SubcommandGroup } from '@/types/command';

export async function parseSlashCommands(commandsPath: string) {
  const restPayload = [];
  const memoryCommands = new Map<string, SlashCommand | SubcommandGroup>();

  let loadedSubcommands = 0,
    totalSubcommands = 0;
  let loadedCommands = 0,
    totalCommands = 0;

  const folders = readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = join(commandsPath, folder);

    if (statSync(folderPath).isDirectory()) {
      const files = readdirSync(folderPath).filter(
        (file) => file.endsWith('.ts') || file.endsWith('.js'),
      );
      const mainCommand = new SlashCommandBuilder()
        .setName(folder)
        .setDescription(`${folder} commands`);
      const subcommands: Record<string, SlashCommand> = {};

      for (const file of files) {
        const filePath = join(folderPath, file);

        const imported = require(filePath);
        const command = imported.default || imported;

        if (command && 'data' in command && 'execute' in command) {
          const subcommandName = file.replace(/\.(ts|js)$/, '');
          totalSubcommands++;
          mainCommand.addSubcommand(command.data);
          subcommands[subcommandName] = command;
          loadedSubcommands++;
        }
      }

      totalCommands++;
      loadedCommands++;
      restPayload.push(mainCommand.toJSON());

      const groupCommand: SubcommandGroup = {
        isGroup: true,
        subcommands,
        data: mainCommand,
        execute: async (interaction) => {
          if (!interaction.isChatInputCommand()) return;
          const subCommandName = interaction.options.getSubcommand();
          const subCommand = subcommands[subCommandName];

          if (!subCommand) {
            console.error(`No se encontró el subcomando ${subCommandName}`);
            return;
          }
          try {
            await subCommand.execute(interaction);
          } catch (error) {
            console.error(error);
          }
        },
      };

      memoryCommands.set(folder, groupCommand);
    } else if (folder.endsWith('.ts') || folder.endsWith('.js')) {
      const filePath = join(commandsPath, folder);

      const imported = require(filePath);
      const command = imported.default || imported;

      if (command && 'data' in command && 'execute' in command) {
        memoryCommands.set(command.data.name, command);
        restPayload.push(command.data.toJSON());
        totalCommands++;
        loadedCommands++;
      }
    }
  }

  console.log(
    chalk.blue(`[Slash] `) +
      chalk.white(`SubComandos cargados: ${loadedSubcommands}/${totalSubcommands}`),
  );
  console.log(
    chalk.blue(`[Slash] `) + chalk.white(`Comandos cargados: ${loadedCommands}/${totalCommands}`),
  );

  return { restPayload, memoryCommands };
}

export async function loadSlashCommands(client: ExtendedClient, commandsPath: string) {
  const { memoryCommands } = await parseSlashCommands(commandsPath);

  for (const [name, command] of memoryCommands) {
    client.slashCommands.set(name, command);
  }
}

async function loadPrefixCommands(client: ExtendedClient, commandsPath: string) {
  const items = readdirSync(commandsPath);
  let loadedCommands = 0;
  let totalCommands = 0;

  for (const item of items) {
    const folderPath = join(commandsPath, item);
    if (!statSync(folderPath).isDirectory()) continue;
    const commandFiles = readdirSync(folderPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );

    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      const imported = require(filePath);

      const command = imported.default || imported;

      if ('name' in command && 'execute' in command) {
        client.prefixCommands.set(command.name, command);
        totalCommands++;
        loadedCommands++;
      }
    }
  }

  console.log(
    chalk.magenta(`[Prefix] `) +
      chalk.white(`Comandos cargados: ${loadedCommands}/${totalCommands}`),
  );
}

export async function loadCommands(client: ExtendedClient) {
  const slashCommandsPath = join(__dirname, '..', 'commands', 'slash');
  const prefixCommandsPath = join(__dirname, '..', 'commands', 'prefix');

  try {
    await loadSlashCommands(client, slashCommandsPath);
    await loadPrefixCommands(client, prefixCommandsPath);
  } catch (error) {
    console.error(error);
  }
}
