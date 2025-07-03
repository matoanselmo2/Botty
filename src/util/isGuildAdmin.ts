import { GuardFunction, SimpleCommandMessage } from "discordx";
import { CommandInteraction, PermissionsBitField } from "discord.js";

export const IsGuildAdmin: GuardFunction<CommandInteraction | SimpleCommandMessage> = 
  async (arg, client, next) => {
    // Slash command
    if ("memberPermissions" in arg) {

        if (arg.memberPermissions === null) {
            return await arg.reply({
              content: "❌ Você precisa ser administrador para usar esse comando.",
              ephemeral: true
            });
        }

        if (arg.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
            await next();
        } else {
            await arg.reply({
            content: "❌ Você precisa ser administrador para usar esse comando.",
            ephemeral: true
            });
        }
        }

        // SimpleCommandMessage (/simple commands)
        else if ("message" in arg) {
        const member = arg.message.member;
        if (member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await next();
        } else {
            await arg.message.reply("❌ Você precisa ser administrador.");
        }
        }

        // Se cair aqui, provavelmente DM ou algo estranho
        else {
        console.warn("IsGuildAdmin: tipo desconhecido");
        }
  };
