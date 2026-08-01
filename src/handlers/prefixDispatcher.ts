import { Message } from 'discord.js';
import type { ExtendedClient } from '@/structure/Client';
import { config } from '@/config';
import chalk from 'chalk';
import { isDeveloper, getMissingPermissions, checkCooldown } from '@/utils/validators';

export const handlePrefixCommand = async (message: Message, client: ExtendedClient) => {
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command =
    client.prefixCommands.get(commandName) ||
    client.prefixCommands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;

  try {
    if (command.developer && !isDeveloper(message.author.id)) {
      return message.reply('Comando no disponible');
    }

    const botMissingPerms = getMissingPermissions(
      message.guild?.members.me,
      command.permissions?.bot as bigint[],
    );
    if (botMissingPerms.length)
      return message.reply(`Necesito permisos: ${botMissingPerms.join(', ')}`);

    const userMissingPerms = getMissingPermissions(
      message.member,
      command.permissions?.user as bigint[],
    );
    if (userMissingPerms.length)
      return message.reply(`Necesitas permisos: ${userMissingPerms.join(', ')}`);

    if (command.cooldown) {
      const timeLeft = checkCooldown(
        message.author.id,
        command.name,
        command.cooldown,
        client.cooldowns,
      );
      if (timeLeft !== null) {
        const msg = await message.reply(`Espera ${timeLeft.toFixed(1)} segundos.`);
        setTimeout(
          () =>
            msg
              .delete()
              .catch(() =>
                console.log(chalk.red('[ERROR]') + ' No se eliminó mensaje de cooldown'),
              ),
          5000,
        );
        return;
      }
    }

    await command.execute(message, args);
  } catch (error) {
    console.error(`[Command Error: ${commandName}]`, error);
    message.reply('Ocurrió un error interno al procesar el comando.');
  }
};
