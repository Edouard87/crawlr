/**
 * MongoDB Mongoose Schema Definitions
 *
 * This file contains Mongoose schemas and models
 * for the BarCrawler application's MongoDB collections.
 */

import mongoose, { Schema, Document, Types } from "mongoose";

// ============================================================================
// User Schema
// ============================================================================

export interface IUser extends Document {
  email: string;
  displayName: string;
  role: "coordinator" | "participant" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    role: {
      type: String,
      enum: ["coordinator", "participant", "admin"],
      required: true,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);

// ============================================================================
// Bar Schema
// ============================================================================

export interface IBar extends Document {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  category?: string[];
  description?: string;
  rating?: number;
  priceRange?: number;
  hours?: {
    [key: string]: { open: string; close: string };
  };
  images?: string[];
  phoneNumber?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BarSchema: Schema<IBar> = new Schema<IBar>(
  {
    name: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    category: [{ type: String }],
    description: { type: String },
    rating: { type: Number },
    priceRange: { type: Number },
    hours: {
      type: Schema.Types.Mixed,
      default: {},
    },
    images: [{ type: String }],
    phoneNumber: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

export const BarModel = mongoose.model<IBar>("Bar", BarSchema);

// ============================================================================
// Event Schema
// ============================================================================

export interface IEvent extends Document {
  name: string;
  description?: string;
  createdBy: Types.ObjectId; // Reference to User
  participants: Types.ObjectId[]; // References to Users
  bars: Types.ObjectId[]; // References to Bars, in order
  startDate: Date;
  endDate?: Date;
  status: "planned" | "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema<IEvent> = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bars: [{ type: Schema.Types.ObjectId, ref: "Bar" }],
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["planned", "active", "completed", "cancelled"],
      required: true,
    },
  },
  { timestamps: true }
);

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);

// ============================================================================
// Review Schema
// ============================================================================

export interface IReview extends Document {
  barId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema<IReview>(
  {
    barId: { type: Schema.Types.ObjectId, ref: "Bar", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    photos: [{ type: String }],
  },
  { timestamps: true }
);

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);

// ============================================================================
// Check-in Schema
// ============================================================================

export interface ICheckIn extends Document {
  userId: Types.ObjectId; // Reference to User
  barId: Types.ObjectId; // Reference to Bar
  crawlId?: Types.ObjectId; // Optional reference to Crawl
  timestamp: Date;
  notes?: string;
}

const CheckInSchema: Schema<ICheckIn> = new Schema<ICheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    barId: { type: Schema.Types.ObjectId, ref: "Bar", required: true },
    crawlId: { type: Schema.Types.ObjectId, ref: "Event" },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }
);

export const CheckInModel = mongoose.model<ICheckIn>("CheckIn", CheckInSchema);

// ============================================================================
// Collection Names (for reference)
// ============================================================================

export const COLLECTIONS = {
  USERS: "users",
  BARS: "bars",
  CRAWLS: "events", // renamed to events for Mongo
  REVIEWS: "reviews",
  CHECK_INS: "checkins",
} as const;

// ============================================================================
// Helper Types
// ============================================================================

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

