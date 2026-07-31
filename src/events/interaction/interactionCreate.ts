import { Collection, Events, MessageFlags, type Interaction } from 'discord.js';
import type { ExtendedClient } from '@/structure/Client';
import type { SlashCommand, SubcommandGroup } from '@/types/command';
import { config } from '@/config';

const cooldowns = new Collection<string, Collection<string, number>>();

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: ExtendedClient) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      if (command.developer && !config.developers.includes(interaction.user.id)) {
        return interaction.reply({
          content: 'Este comando solo está disponible para desarrolladores.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (command.permissions?.bot) {
        const botPermissions = interaction.guild?.members.me?.permissions;
        const missingPermissions = command.permissions.bot.filter(
          (permission) => !botPermissions?.has(permission),
        );

        if (missingPermissions.length > 0) {
          return interaction.reply({
            content: `No tengo los siguientes permisos requeridos: ${missingPermissions.join(
              ', ',
            )}`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      if (command.permissions?.user) {
        const missingPermissions = command.permissions.user.filter(
          (permission) => !interaction.memberPermissions?.has(permission),
        );

        if (missingPermissions.length > 0) {
          return interaction.reply({
            content: `No tienes los siguientes permisos requeridos: ${missingPermissions.join(
              ', ',
            )}`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      const now = Date.now();
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const timestamps = cooldowns.get(command.data.name);
      let cooldownAmount = (command.cooldown || 3) * 1000;

      if (isSubcommandGroup(command)) {
        const subcommandName = interaction.options.getSubcommand();
        const subcommand = command.subcommands[subcommandName];

        if (!subcommand) {
          return interaction.reply({
            content: 'Subcomando no encontrado.',
            flags: MessageFlags.Ephemeral,
          });
        }

        if (subcommand.developer && !config.developers.includes(interaction.user.id)) {
          return interaction.reply({
            content: 'Este subcomando solo está disponible para desarrolladores.',
            flags: MessageFlags.Ephemeral,
          });
        }

        if (subcommand.permissions?.bot) {
          const botPermissions = interaction.guild?.members.me?.permissions;
          const missingPermissions = subcommand.permissions.bot.filter(
            (permission) => !botPermissions?.has(permission),
          );

          if (missingPermissions.length > 0) {
            return interaction.reply({
              content: `No tengo los siguientes permisos requeridos: ${missingPermissions.join(
                ', ',
              )}`,
              flags: MessageFlags.Ephemeral,
            });
          }
        }

        if (subcommand.permissions?.user) {
          const missingPermissions = subcommand.permissions.user.filter(
            (permission) => !interaction.memberPermissions?.has(permission),
          );

          if (missingPermissions.length > 0) {
            return interaction.reply({
              content: `No tienes los siguientes permisos requeridos: ${missingPermissions.join(
                ', ',
              )}`,
              flags: MessageFlags.Ephemeral,
            });
          }
        }

        cooldownAmount = (subcommand.cooldown || command.cooldown || 3) * 1000;
      }

      const userCooldown = timestamps?.get(interaction.user.id);
      if (userCooldown) {
        const expirationTime = userCooldown + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: `Por favor espera ${timeLeft.toFixed(
              1,
            )} segundos antes de usar este comando nuevamente.`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      timestamps?.set(interaction.user.id, now);
      setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

      if (isSubcommandGroup(command)) {
        const subcommandName = interaction.options.getSubcommand();
        await command.subcommands[subcommandName].execute(interaction);
      } else {
        await command.execute(interaction);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '¡Hubo un error al ejecutar este comando!',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

function isSubcommandGroup(command: SlashCommand): command is SubcommandGroup {
  return 'isGroup' in command && (command as any).isGroup === true;
}
