import { GuildConfig, type IGuildConfig } from "../models/GuildConfig.js";

export async function getGuildConfig(gid: string): Promise<IGuildConfig> {
  // devolve doc (ou cria com defaults)
  return (
    await GuildConfig.findOne({ guildId: gid })
  ) ?? (await GuildConfig.create({ guildId: gid }));
}

export async function patchGuildConfig(
  gid: string,
  patch: Partial<Omit<IGuildConfig, "guildId">>
) {
  return GuildConfig.findOneAndUpdate(
    { guildId: gid },
    { $set: patch },
    { new: true, upsert: true }
  );
}
