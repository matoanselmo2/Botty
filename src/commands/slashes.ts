import { ApplicationCommandOptionType, SlashCommandRoleOption, type CommandInteraction, type Role, type TextChannel } from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { patchGuildConfig, getGuildConfig } from "../util/guildConfig.js";
import { getUserConfig, setUserLanguage } from "../util/userConfig.js";
import { IsGuildAdmin } from "../util/isGuildAdmin.js";
import { EmbedBuilder } from "discord.js";
import { t } from "../util/lang.js";
import type { GuildConfig, IGuildConfig } from "../models/GuildConfig.js";

const langMap: Record<string, string> = {
  br: "Português (Brasileiro)",
  en: "English",
  es: "Español"
};

@Discord()
export class Example {
  @Slash({ name: "ping", description: "Verify bot's latency & api latency" })
  async ping(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    const sent = await interaction.fetchReply();
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = interaction.client.ws.ping;

    const reply = await t('ping', {
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
      vars: {
        latency: latency.toString(),
        apiLatency: apiLatency.toString()
      }
    })

    await interaction.editReply(
      reply
    );
  }

@Slash({ description: "Guild configuration (Admin only)" })
@Guard(IsGuildAdmin)
async config(
  @SlashChoice({ name: "Português (Brasileiro)", value: "br" })
  @SlashChoice({ name: "English",   value: "en" })
  @SlashChoice({ name: "Español",   value: "es" })
  @SlashOption({ description: "Guild language", name: "guild_language", required: false, type: ApplicationCommandOptionType.String})
  guildLanguage: "br" | "en" | "es",

  @SlashOption({ description: "Selects the Admin role", name: "admin_role", required: false, type: ApplicationCommandOptionType.Role })
  adminRole: Role | undefined,

  @SlashOption({ description: "Selects the Verified role", name: "verified_role", required: false, type: ApplicationCommandOptionType.Role })
  verifiedRole: Role | undefined,

  @SlashOption({ description: "Selects the Admin channel", name: "admin_channel", required: false, type: ApplicationCommandOptionType.Channel })
  adminChannel: TextChannel | undefined,

  @SlashOption({ description: "Enables verification for new members", name: "enable_verification", required: false, type: ApplicationCommandOptionType.Boolean })
  enableVerification: boolean | undefined,

  @SlashOption({ description: "Keeps bot's configuration if it leaves the guild", name: "keep_config_on_exit", required: false, type: ApplicationCommandOptionType.Boolean })
  keepConfigOnExit: boolean | undefined,

  interaction: CommandInteraction
) {
  const patch: Record<string, unknown> = {};
  if (guildLanguage) patch.language = guildLanguage;
  if (adminRole)    patch.adminRoleId    = adminRole.id;
  if (verifiedRole) patch.verifiedRoleId = verifiedRole.id;
  if (adminChannel) patch.adminChannelId = adminChannel.id;
  if (enableVerification !== undefined) patch.enableVerification = enableVerification;
  if (keepConfigOnExit !== undefined) patch.keepConfigOnExit = keepConfigOnExit;

  const cfg = await getGuildConfig(interaction.guildId!);

  if (Object.keys(patch).length === 0) {

    const formattedLang = cfg.language ? (langMap[cfg.language as keyof typeof langMap] || cfg.language) : "Indefinido";

    const embed = await buildGuildConfigEmbed(
      interaction.guildId!,
      cfg,
      formattedLang
    );

    await interaction.reply({ embeds: [embed]});
    return;
  }

  if (patch.enableVerification) {
    const missing: string[] = [];

    if (!cfg.adminChannelId) missing.push(await t("guild_config:missing_admin_channel", { guildId: interaction.guildId! }));
    if (!cfg.adminRoleId)    missing.push(await t("guild_config:missing_admin_role", { guildId: interaction.guildId! }));
    if (!cfg.verifiedRoleId) missing.push(await t("guild_config:missing_verified_role", { guildId: interaction.guildId! }));

    if (missing.length > 0) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(await t("guild_config:invalid_title", { guildId: interaction.guildId! }))
        .setDescription(await t("guild_config:invalid_description", { guildId: interaction.guildId! }))
        .addFields({ name: await t("guild_config:missing_fields", { guildId: interaction.guildId! }), value: missing.join("\n") })
        .setFooter({ text: await t("guild_config:see_config_command", { guildId: interaction.guildId! }) });

      await interaction.reply({ embeds: [embed] });
      return;
    }
  }

  await patchGuildConfig(interaction.guildId!, patch);
  await interaction.reply(await t("guild_config:saved", { guildId: interaction.guildId! }));
}

@Slash({ name: "language", description: "Choose your personal language" })
async setLanguage(
  @SlashChoice({ name: "Português (Brasileiro)", value: "br" })
  @SlashChoice({ name: "English",   value: "en" })
  @SlashChoice({ name: "Español",   value: "es" })
  @SlashOption({
    name: "lang",
    description: "Select your language",
    type: ApplicationCommandOptionType.String,
    required: false
  })
  lang: "br" | "en" | "es",
  interaction: CommandInteraction
) {

if (!lang) {
  const cfg      = await getUserConfig(interaction.user.id);
  const guildCfg = await getGuildConfig(interaction.guildId!);

  // ── Ainda não definiu idioma? ─────────────────────────────
  if (!cfg.language) {
    const embed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setDescription(
        await t("user_lang:not_set", {
          guildId: interaction.guildId!,
          userId : interaction.user.id
        })
      );

    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ── Mostra idiomas atual (user + guild) ──────────────────
  const userLangName  = langMap[cfg.language]  ?? cfg.language;
  const guildLangName = guildCfg.language
      ? langMap[guildCfg.language] ?? guildCfg.language
      : await t("cfg_value_undefined", { guildId: interaction.guildId! });

  const embed = new EmbedBuilder()
    .setColor(0x00BFFF)
    .setDescription(
      await t("user_lang:show", {
        guildId: interaction.guildId!,
        vars: { userLang: userLangName, guildLang: guildLangName }
      })
    );

  await interaction.reply({ embeds: [embed] });
  return;
}

// ── Atualiza idioma do usuário ─────────────────────────────
await setUserLanguage(interaction.user.id, lang);

const embed = new EmbedBuilder()
  .setColor(0x00FF00)
  .setDescription(
    await t("user_lang:updated", {
      guildId: interaction.guildId!,
      userId : interaction.user.id,
      vars   : { newLang: langMap[lang] }
    })
  );

await interaction.reply({ embeds: [embed] });
}
}

async function buildGuildConfigEmbed(
  guildId: string,
  cfg: IGuildConfig,
  formattedLang: string
) {
  const embed = new EmbedBuilder()
    .setColor(0x00BFFF)
    .setTitle(await t("cfg_embed_title", { guildId }))
    .setDescription(await t("cfg_embed_desc", { guildId }))
    .addFields(
      {
        name: await t("cfg_field_language", { guildId }),
        value: formattedLang,
        inline: true
      },
      {
        name: await t("cfg_field_admin_channel", { guildId }),
        value: cfg.adminChannelId
          ? `<#${cfg.adminChannelId}>`
          : await t("cfg_value_undefined", { guildId }),
        inline: true
      },
      {
        name: await t("cfg_field_admin_role", { guildId }),
        value: cfg.adminRoleId
          ? `<@&${cfg.adminRoleId}>`
          : await t("cfg_value_undefined", { guildId }),
        inline: true
      },
      {
        name: await t("cfg_field_verified_role", { guildId }),
        value: cfg.verifiedRoleId
          ? `<@&${cfg.verifiedRoleId}>`
          : await t("cfg_value_undefined", { guildId }),
        inline: true
      },
      {
        name: await t("cfg_field_verification_enabled", { guildId }),
        value: await t(cfg.enableVerification ? "cfg_value_yes" : "cfg_value_no", {
          guildId
        }),
        inline: true
      },
      {
        name: await t("cfg_field_keep_config", { guildId }),
        value: await t(cfg.keepConfigOnExit ? "cfg_value_yes" : "cfg_value_no", {
          guildId
        }),
        inline: true
      }
    )
    .setFooter({ text: await t("cfg_footer", { guildId }) });

  return embed;
}