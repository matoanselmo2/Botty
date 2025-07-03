import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";

export function buildVerificationEmbed(targetId: string) {
  return new EmbedBuilder()
    .setTitle("Verification Required")
    .setDescription(`Approve <@${targetId}>?`)
    .setColor("Yellow");
}

export function buildVerificationRow(targetId: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve_${targetId}`)
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`deny_${targetId}`)
      .setLabel("Deny")
      .setStyle(ButtonStyle.Danger)
  );
}
