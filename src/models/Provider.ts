import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProvider extends Document {
  name: string;
  services: string[];
  monthlyQuota: number;
  usedQuota: number;
  createdAt: Date;
}

const providerSchema = new Schema<IProvider>(
  {
    name: { type: String, required: true },
    services: { type: [String], required: true },
    monthlyQuota: { type: Number, default: 10, required: true },
    usedQuota: { type: Number, default: 0, required: true },
  },
  { timestamps: true }
);

const Provider: Model<IProvider> = mongoose.models.Provider || mongoose.model<IProvider>('Provider', providerSchema);
export default Provider;
