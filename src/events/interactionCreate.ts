import {
  Collection,
  Events,
  GuildMember,
  MessageFlags,
  type Interaction,
  type InteractionReplyOptions,
} from 'discord.js';
import type { ExtendedClient } from '@/structure/Client';
import type { SlashCommand, SubcommandGroup } from '@/types/command';
import { checkCooldown, getMissingPermissions, isDeveloper } from '@/utils/validators';

const cooldowns = new Collection<string, Collection<string, number>>();

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: ExtendedClient) {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        let targetExecution: any = command;
        let commandId = command.data.name;

        if (isSubcommandGroup(command)) {
          const subcommandName = interaction.options.getSubcommand();
          const subcommand = command.subcommands[subcommandName];

          if (!subcommand) {
            return interaction.reply({
              content: 'Subcomando no encontrado.',
              flags: MessageFlags.Ephemeral,
            });
          }

          targetExecution = subcommand;
          commandId = `${command.data.name}-${subcommandName}`;
        }

        if (targetExecution.developer && !isDeveloper(interaction.user.id)) {
          return interaction.reply({
            content: 'Comando exclusivo para desarrolladores.',
            flags: MessageFlags.Ephemeral,
          });
        }

        const botMissingPerms = getMissingPermissions(
          interaction.guild?.members.me,
          targetExecution.permissions?.bot,
        );
        if (botMissingPerms.length) {
          return interaction.reply({
            content: `Me faltan permisos: ${botMissingPerms.join(', ')}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const userMissingPerms = (interaction.member as GuildMember)?.permissions
          ? getMissingPermissions(
              interaction.member as GuildMember,
              targetExecution.permissions?.user,
            )
          : [];
        if (userMissingPerms.length) {
          return interaction.reply({
            content: `Te faltan permisos: ${userMissingPerms.join(', ')}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const cooldownAmount = targetExecution.cooldown ?? command.cooldown ?? 3;
        const timeLeft = checkCooldown(interaction.user.id, commandId, cooldownAmount, cooldowns);

        if (timeLeft !== null) {
          return interaction.reply({
            content: `Por favor espera ${timeLeft.toFixed(1)} segundos.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        await targetExecution.execute(interaction);
      } catch (error) {
        console.error(error);
        const errorPayload: InteractionReplyOptions = {
          content: '¡Hubo un error al ejecutar este comando!',
          flags: MessageFlags.Ephemeral,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorPayload);
        } else {
          await interaction.reply(errorPayload);
        }
      }
    }

    if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
      const component = client.components.get(interaction.customId);

      if (!component) {
        return interaction.reply({
          content: 'Componente no encontrado.',
          flags: MessageFlags.Ephemeral,
        });
      }

      try {
        await component.execute(interaction, client);
      } catch (error) {
        console.error(`Error en componente ${interaction.customId}:`, error);

        const errorPayload: InteractionReplyOptions = {
          content: 'Error al procesar esta acción.',
          flags: MessageFlags.Ephemeral,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorPayload);
        } else {
          await interaction.reply(errorPayload);
        }
      }
      return;
    }
  },
};

function isSubcommandGroup(command: SlashCommand): command is SubcommandGroup {
  return 'isGroup' in command && (command as any).isGroup === true;
}
