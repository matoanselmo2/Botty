import { Discord, On } from "discordx";
import type { ArgsOf, Client } from "discordx";
import { ADMIN_CHANNEL_ID, ADMIN_ROLE_ID } from "../config.js";
import { buildVerificationEmbed, buildVerificationRow } from "../util/verification.js";
import { Verification } from "../models/VerificationRequest.js";
import { getGuildConfig } from "../util/guildConfig.js";

@Discord()
export class GuildMemberAdd {
  @On()
  async guildMemberAdd(
    [member]: ArgsOf<"guildMemberAdd">,
    client: Client
  ): Promise<void> {
    if (member.user.bot) return;

    const guild = member.guild;

    const cfg = await getGuildConfig(guild.id);

    const adminChannelId = cfg.adminChannelId ?? ADMIN_CHANNEL_ID;
    const adminRoleId    = cfg.adminRoleId   ?? ADMIN_ROLE_ID;

    const adminRole    = await guild.roles.fetch(adminRoleId);
    const adminChannel = await guild.channels.fetch(adminChannelId);

    if (!adminRole) {
      console.error("Cargo de administrador não encontrado.");
      return;
    }

    if (!adminChannel?.isTextBased()) {
      console.error("Admin channel not found or is not text-based.");
      return;
    }

    const embed = buildVerificationEmbed(member.id);

    const sentMsg = await adminChannel.send({
      content: `New member joined: ${member.user.username}`,
      embeds:     [embed],
      components: [buildVerificationRow(member.id).toJSON()]
    });

    await Verification.create({
        guildId: guild.id,
        userId:  member.id,
        messageId: sentMsg.id, // ⬅️ guarde o ID retornado pelo send()
    });
  }
}
