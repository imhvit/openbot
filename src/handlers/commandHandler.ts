import { config } from '@/config';
import chalk from 'chalk';
import type { ExtendedClient } from '@/structure/Client';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand, SubcommandGroup } from '@/types/command';

async function loadSlashCommands(client: ExtendedClient, commandsPath: string) {
  const commands = [];
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

        if ('data' in command && 'execute' in command) {
          const subcommandName = file.replace('.ts', '').replace('.js', '');

          mainCommand.addSubcommand(command.data);

          subcommands[subcommandName] = command;

          console.log(
            chalk.blue(`[SLASH] `) +
              chalk.white(`SubComando cargado: /${folder} ${subcommandName}`),
          );
        }
      }

      commands.push(mainCommand.toJSON());
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
      client.slashCommands.set(folder, groupCommand);
    } else if (folder.endsWith('.ts') || folder.endsWith('.js')) {
      const filePath = join(commandsPath, folder);
      const imported = require(filePath);
      const command = imported.default || imported;

      if ('data' in command && 'execute' in command) {
        client.slashCommands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(chalk.blue(`[SLASH] `) + chalk.white(`Comando cargado: /${command.data.name}`));
      }
    }
  }

  return commands;
}

async function loadPrefixCommands(client: ExtendedClient, commandsPath: string) {
  const items = readdirSync(commandsPath);

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
        console.log(
          chalk.magenta(`[PREFIX] `) +
            chalk.white(`Comando cargado: ${config.prefix}${command.name}`),
        );
      }
    }
  }
}

export async function loadCommands(client: ExtendedClient) {
  const slashCommandsPath = join(__dirname, '..', 'commands', 'slash');
  const prefixCommandsPath = join(__dirname, '..', 'commands', 'prefix');

  const slashCommands = await loadSlashCommands(client, slashCommandsPath);

  await loadPrefixCommands(client, prefixCommandsPath);

  const rest = new REST().setToken(client.config.token);

  try {
    console.log(chalk.yellow('Actualizando comandos slash...'));

    await rest.put(Routes.applicationCommands(config.clientId), {
      body: slashCommands,
    });

    console.log(chalk.green('Comandos slash actualizados.'));
  } catch (error) {
    console.error(error);
  }
}
