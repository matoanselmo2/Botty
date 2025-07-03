import { UserConfig, type IUserConfig } from "../models/UserConfig.js";

export async function getUserConfig(userId: string): Promise<IUserConfig> {
  return (
    await UserConfig.findOne({ userId })
  ) ?? (await UserConfig.create({ userId }));
}

export async function setUserLanguage(
  userId: string,
  language: "br" | "en" | "es"
) {
  return UserConfig.findOneAndUpdate(
    { userId },
    { $set: { language } },
    { new: true, upsert: true }
  );
}
