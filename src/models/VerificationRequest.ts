import { Schema, model, type Document } from "mongoose";

export interface IVerification extends Document {
  guildId:    string;
  userId:     string;
  messageId:  string;   // msg no canal de admin
  status:     "pending" | "approved" | "denied";
  approvers:  string[]; // admins que clicaram
  createdAt:  Date;
  updatedAt:  Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    guildId:   { type: String, index: true },
    userId:    { type: String, index: true },
    messageId: String,
    status:    { type: String, default: "pending" },
    approvers: [String]
  },
  { timestamps: true }
);

verificationSchema.index({ guildId: 1, userId: 1 }, { unique: true });

export const Verification = model<IVerification>("Verification", verificationSchema);
