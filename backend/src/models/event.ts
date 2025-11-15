import mongoose, { Schema, Document, Types } from "mongoose";

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