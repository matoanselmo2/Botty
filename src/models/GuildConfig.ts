import { Schema, model, type Document } from "mongoose";

export interface IGuildConfig extends Document {
  guildId:            string;            
  language?:          "br" | "en" | "es"; 
  adminRoleId?:       string;
  adminChannelId?:    string;
  verifiedRoleId?:    string;
  enableVerification?: boolean;
  keepConfigOnExit?: boolean;
  createdAt:          Date;
  updatedAt:          Date;
}

const guildCfg = new Schema<IGuildConfig>(
  {
    guildId: { type: String, required: true, unique: true },
    language: { type: String, enum: ["br", "en", "es"], default: "en" },
    adminRoleId:    String,
    adminChannelId: String,
    verifiedRoleId: String,
    enableVerification: { type: Boolean, default: false }, 
    keepConfigOnExit: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const GuildConfig = model<IGuildConfig>("GuildConfig", guildCfg);
