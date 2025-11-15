import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEvent extends Document {
  name: string;
  createdBy: Types.ObjectId; // Reference to User
  coordinatorPassword: string;
  participants: Types.ObjectId[]; // References to Users
  coordinators: Types.ObjectId[];
  stops: Types.ObjectId[]; // References to Bars, in order
  signInCode: string;
  coordinatorCode: string;
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

  signInCode: {
    type: String,
    required: false
  },
  coordinatorCode: {
    type: String,
    required: false
  }
  },
  { timestamps: true }
);

function randomCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ''
  for (let i = 0; i < 6; i++) {
  result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result;
}

EventSchema.pre('save', function(next) {
  
  this.signInCode = randomCode();
  this.coordinatorCode = randomCode();
  next();
})

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);