import mongoose, { Schema, Document } from "mongoose";

export interface IGenerationHistoryDocument extends Document {
  userId: string;
  messageTypeId: string;
  messageTypeName: string;
  categoryName: string;
  input: string;
  output: string;
  modelUsed: string;
  tokensUsed?: number;
  createdAt: Date;
  updatedAt: Date;
}

const GenerationHistorySchema = new Schema<IGenerationHistoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    messageTypeId: { type: String, required: true, index: true },
    messageTypeName: { type: String, required: true },
    categoryName: { type: String, required: true },
    input: { type: String, required: true },
    output: { type: String, required: true },
    modelUsed: { type: String, required: true },
    tokensUsed: { type: Number },
  },
  { timestamps: true }
);

GenerationHistorySchema.index({ userId: 1, createdAt: -1 });

export const GenerationHistoryModel =
  mongoose.models.GenerationHistory ||
  mongoose.model<IGenerationHistoryDocument>("GenerationHistory", GenerationHistorySchema);
