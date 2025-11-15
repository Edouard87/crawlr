import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBar extends Document {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BarSchema: Schema<IBar> = new Schema<IBar>(
  {
  name: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }
  },
  { timestamps: true }
);

export const BarModel = mongoose.model<IBar>("Bar", BarSchema);