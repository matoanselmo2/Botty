import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ MongoDB conectado.");
}
