import { Discord, On } from "discordx";
import type { ArgsOf, Client } from "discordx";
import { Verification } from "../models/VerificationRequest.js";
import {
  ADMIN_CHANNEL_ID,
  VERIFIED_ROLE_ID
} from "../config.js";
import { getGuildConfig } from "../util/guildConfig.js";

@Discord()
export class InteractionCreate {
  @On()
  async interactionCreate(
    [interaction]: ArgsOf<"interactionCreate">,
    client: Client
  ): Promise<void> {
    if (!interaction.isButton()) return;

    const [action, targetId] = interaction.customId.split("_");
    if (!["approve", "deny"].includes(action) || !targetId) return;

    const guild = interaction.guild;

    if (!guild) return;

    const cfg = await getGuildConfig(guild.id);

    const target = await guild.members.fetch(targetId).catch(() => null);
    if (!target) {
      interaction.reply({ content: "Membro não encontrado." });
      return;
    }

    const vr = await Verification.findOne({
        guildId: guild.id,
        userId:  target.id,
        status:  "pending"
    });

    const adminChannel = await guild.channels.fetch(cfg.adminChannelId ?? ADMIN_CHANNEL_ID);
    if (!adminChannel?.isTextBased()) {
      interaction.reply({ content: "Canal de administração inacessível." });
      return;
    }

    // Procura a mensagem de verificação mais recente
    const recent = await adminChannel.messages.fetch({ limit: 20 });
    const verifyMsg = recent.find(
        (m) => m.author.id === client.user?.id && m.content.includes(target.user.username)
    );

    if (!vr) {
        interaction.reply({ content: "Registro não encontrado." });
        return;
    }

    if (action === "approve") {
        const role = await guild.roles.fetch(cfg.verifiedRoleId ?? VERIFIED_ROLE_ID);

        if (!role) {
            interaction.reply({ content: "Cargo não encontrado." });
            return
        }

        vr.status = "approved";
        vr.approvers.push(interaction.user.id);
        await vr.save();

        await target.roles.add(role);
        await interaction.reply({ content: `✅ ${target.user.tag} aprovado!` });

        verifyMsg?.edit({ content: `✅ ${target.user.tag} aprovado!`, embeds: [], components: [] });
    } else {
        vr.status = "denied";
        vr.approvers.push(interaction.user.id);
        await vr.save();

        await target.kick("Denied by admin").catch(() => null);
        await interaction.reply({ content: `❌ ${target.user.tag} negado.` });

        verifyMsg?.edit({ content: `❌ ${target.user.tag} negado.`, embeds: [], components: [] });
    }
  }
}
