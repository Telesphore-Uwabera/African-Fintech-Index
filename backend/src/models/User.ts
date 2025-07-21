import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  isVerified: boolean;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
});

export const User = mongoose.model<IUser>('User', UserSchema); 