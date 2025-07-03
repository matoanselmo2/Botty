// src/models/UserConfig.ts
import { Schema, model, type Document } from "mongoose";

export interface IUserConfig extends Document {
  userId: string;
  language?: "br" | "en" | "es";
  createdAt: Date;
  updatedAt: Date;
}

const userCfg = new Schema<IUserConfig>(
  {
    userId:   { type: String, required: true, unique: true },
    language: { type: String, enum: ["br", "en", "es"] }
  },
  { timestamps: true }
);

export const UserConfig = model<IUserConfig>("UserConfig", userCfg);
