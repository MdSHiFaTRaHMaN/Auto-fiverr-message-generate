import mongoose, { Schema, Document } from "mongoose";

export interface IMessageTypeDocument extends Document {
  userId: string;
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  systemInstruction: string;
  messageStructure: string;
  writingStyle: string;
  rules: string[];
  examples: { input: string; output: string }[];
  outputFormat: "plain_text" | "markdown";
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema = new Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
  },
  { _id: false }
);

const MessageTypeSchema = new Schema<IMessageTypeDocument>(
  {
    userId: { type: String, required: true, index: true },
    categoryId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String, default: "MessageSquare" },
    systemInstruction: { type: String, required: true },
    messageStructure: { type: String, required: true },
    writingStyle: { type: String, required: true },
    rules: { type: [String], default: [] },
    examples: { type: [ExampleSchema], default: [] },
    outputFormat: { type: String, enum: ["plain_text", "markdown"], default: "plain_text" },
    enabled: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

MessageTypeSchema.index({ userId: 1, name: 1 });

export const MessageTypeModel =
  mongoose.models.MessageType || mongoose.model<IMessageTypeDocument>("MessageType", MessageTypeSchema);
