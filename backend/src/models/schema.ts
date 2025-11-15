/**
 * MongoDB Mongoose Schema Definitions
 *
 * This file contains Mongoose schemas and models
 * for the BarCrawler application's MongoDB collections.
 */

import mongoose, { Schema, Document, Types } from "mongoose";

// Account holder -> event creator
export interface IUser extends Document {
  email: string;
  phoneNumber: string;
  name: string;
  eventsCreated: Types.ObjectId[];
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },

    phoneNumber: { type: String, required: true },

    name: { type: String, required: true },

    eventsCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      }
    ],
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);

export interface IParticipant extends Document {
  name: string,
  phoneNumber: string,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  isCoordinator: boolean,
  stopAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stop"
  }
}

const ParticipantSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    phoneNumber: { 
      type: String, 
      required: true 
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    },

    isCoordinator: { 
      type: Boolean, 
      required: true 
    },

    stopAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop"
    }
  },
  { timestamps: true }
);

export const ParticipantModel = mongoose.model<IParticipant>(
  "Participant",
  ParticipantSchema
);

// Bar object -> persists throughout events
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
  },
  { timestamps: true }
);

export const BarModel = mongoose.model<IBar>("Bar", BarSchema);

// Stop, a stop along path for a certain event

export interface IStop extends Document {
  bar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bar",
    required: true,
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coordinator",
    required: true,
  }
  currentGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  waitingGroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    }
  ],
  inTransitGroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    }
  ],
}

const StopSchema = new mongoose.Schema(
  {
    bar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bar",
      required: true,
    },

    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coordinator",
      required: true,
    },

    currentGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },

    waitingGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      }
    ],

    inTransitGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      }
    ],
  },
  { timestamps: true }
);

export const StopModel = mongoose.model<IStop>("Stop", StopSchema);



export interface IEvent extends Document {
  name: string;
  createdBy: Types.ObjectId; // Reference to User
  coordinatorPassword: string;
  participants: Types.ObjectId[]; // References to Users
  coordinators: Types.ObjectId[];
  stops: Types.ObjectId[]; // References to Bars, in order
  startDate: Date;
  endDate?: Date;
  status: "planned" | "active" | "completed" | "cancelled";
}

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      }
    ],

    coordinators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      }
    ],

    stops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
        required: true,
      }
    ],

    status: {
      type: String,
      enum: ["planned", "active", "completed", "cancelled"],
      required: true,
    },
  },
  { timestamps: true }
);

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);

export interface IGroup extends Document {
  number: number;
  name: string;
  event: Types.ObjectId;
  stopsVisited: Types.ObjectId[];
  groupMembers: Types.ObjectId[];
  stop: Types.ObjectId;
  status: "bar" | "transit" | "waiting" | "limbo"
  lastStatusUpdate: Date;
}

const GroupSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    stopsVisited: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
      }
    ],

    groupMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      }
    ],

    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },

    status: {
      type: String,
      enum: ["bar", "transit", "waiting", "limbo"],
      required: true,
    },

    lastStatusUpdate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const GroupModel = mongoose.model<IGroup>("Group", GroupSchema);

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

