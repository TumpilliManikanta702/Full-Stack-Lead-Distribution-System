import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeadAssignment extends Document {
  leadId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  assignedAt: Date;
}

const leadAssignmentSchema = new Schema<ILeadAssignment>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Prevents duplicate provider assignment for the same lead
leadAssignmentSchema.index({ leadId: 1, providerId: 1 }, { unique: true });

const LeadAssignment: Model<ILeadAssignment> =
  mongoose.models.LeadAssignment || mongoose.model<ILeadAssignment>('LeadAssignment', leadAssignmentSchema);
export default LeadAssignment;
