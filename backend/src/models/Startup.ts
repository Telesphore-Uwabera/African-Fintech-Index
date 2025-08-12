import mongoose, { Schema, Document } from 'mongoose';

export interface IStartup extends Document {
  name: string;
  country: string;
  sector: string;
  foundedYear: number;
  description?: string;
  website?: string;
  addedBy?: string;
  addedAt?: Date;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

const StartupSchema = new Schema<IStartup>({
  name: { type: String, required: true },
  country: { type: String, required: true },
  sector: { type: String, required: true },
  foundedYear: { type: Number, required: true },
  description: { type: String },
  website: { type: String },
  addedBy: { type: String },
  addedAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String }
});

export default mongoose.model<IStartup>('Startup', StartupSchema); 