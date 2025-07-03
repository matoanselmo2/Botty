import fs from 'fs';
import path from 'path';
import { getGuildConfig } from '../util/guildConfig.js';
import { getUserConfig }  from '../util/userConfig.js';
import { fileURLToPath } from "url";
import { dirname } from "path";

const DEFAULT_LANG = 'en';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadFile(code: string): Record<string, string> {
  const file = path.join(__dirname, "..", "locales", `${code}.json`);
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export async function resolveLang(userId: string | null, guildId: string | null): Promise<string> {
  if (userId) {
    const userCfg = await getUserConfig(userId);
    if (userCfg?.language) return userCfg.language;
  }
  if (guildId) {
    const guildCfg = await getGuildConfig(guildId);
    if (guildCfg?.language) return guildCfg.language;
  }
  return DEFAULT_LANG;
}

export async function t(
  key: string,
  {
    userId = null,
    guildId = null,
    vars = {} as Record<string, string | number>,
  }: {
    userId?: string | null;
    guildId?: string | null;
    vars?: Record<string, string | number>;
  } = {}
): Promise<string> {
  const lang = await resolveLang(userId, guildId);
  const dict = loadFile(lang);
  let str = dict[key] ?? key;

  for (const [k, v] of Object.entries(vars)) {
    str = str.replaceAll(`{${k}}`, String(v));
  }

  return str;
}
