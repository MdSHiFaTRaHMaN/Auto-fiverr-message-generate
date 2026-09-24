import mongoose, { Schema } from "mongoose";

export interface IUserSettings {
  userId: string;
  provider: "openai";
  model: string;
  temperature: number;
  maxTokens: number;
  theme: "system" | "light" | "dark";
  signature?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, enum: ["openai"], default: "openai" },
    model: { type: String, default: "gpt-4o-mini" },
    temperature: { type: Number, default: 0.7 },
    maxTokens: { type: Number, default: 600 },
    theme: { type: String, enum: ["system", "light", "dark"], default: "system" },
    signature: { type: String, default: "Best regards,\nWeb & Shopify Developer" },
  },
  { timestamps: true }
);

export const UserSettingsModel =
  mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);
