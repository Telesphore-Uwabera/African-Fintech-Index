import mongoose, { Schema, Document } from 'mongoose';

export interface ICountryData extends Document {
  id: string;
  name: string;
  literacyRate: number;
  digitalInfrastructure: number;
  investment: number;
  finalScore: number;
  year: number;
  population?: number;
  gdp?: number;
  fintechCompanies?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

const CountryDataSchema = new Schema<ICountryData>({
  id: { type: String, required: true }, // Country code (e.g., 'NG', 'ZA')
  name: { type: String, required: true },
  literacyRate: { type: Number, required: true, min: 0, max: 100 },
  digitalInfrastructure: { type: Number, required: true, min: 0, max: 100 },
  investment: { type: Number, required: true, min: 0, max: 100 },
  finalScore: { type: Number, required: true, min: 0, max: 100 },
  year: { type: Number, required: true },
  population: { type: Number },
  gdp: { type: Number },
  fintechCompanies: { type: Number },
  createdBy: { type: String },
  updatedBy: { type: String }
}, {
  timestamps: true
});

// Compound index for efficient queries by country and year
CountryDataSchema.index({ id: 1, year: 1 }, { unique: true });

export default mongoose.model<ICountryData>('CountryData', CountryDataSchema); 