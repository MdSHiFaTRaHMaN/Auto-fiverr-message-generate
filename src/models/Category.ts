import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryDocument extends Document {
  userId: string;
  name: string;
  description?: string;
  order: number;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    color: { type: String, default: "#10b981" },
    icon: { type: String, default: "Folder" },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const CategoryModel =
  mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);
