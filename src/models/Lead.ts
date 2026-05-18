import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  name: string;
  phone: string;
  city: string;
  serviceType: string;
  description: string;
  createdAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    serviceType: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate leads for the same phone and serviceType
leadSchema.index({ phone: 1, serviceType: 1 }, { unique: true });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
