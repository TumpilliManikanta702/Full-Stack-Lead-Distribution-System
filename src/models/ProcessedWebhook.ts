import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProcessedWebhook extends Document {
  webhookId: string;
  processedAt: Date;
}

const processedWebhookSchema = new Schema<IProcessedWebhook>(
  {
    webhookId: { type: String, required: true, unique: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const ProcessedWebhook: Model<IProcessedWebhook> =
  mongoose.models.ProcessedWebhook || mongoose.model<IProcessedWebhook>('ProcessedWebhook', processedWebhookSchema);
export default ProcessedWebhook;
