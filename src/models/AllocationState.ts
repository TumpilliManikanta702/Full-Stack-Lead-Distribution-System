import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAllocationState extends Document {
  serviceType: string;
  currentIndex: number;
}

const allocationStateSchema = new Schema<IAllocationState>(
  {
    serviceType: { type: String, required: true, unique: true },
    currentIndex: { type: Number, default: 0, required: true },
  },
  { timestamps: false }
);

const AllocationState: Model<IAllocationState> =
  mongoose.models.AllocationState || mongoose.model<IAllocationState>('AllocationState', allocationStateSchema);
export default AllocationState;
