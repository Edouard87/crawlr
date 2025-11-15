import mongoose, { Schema, Document, Types } from "mongoose";
import { IEvent } from "./event";

export interface IGroup extends Document {
  number: number;
  name: string;
  event: Types.ObjectId | IEvent;
  stopsVisited: Types.ObjectId[];
  groupMembers: Types.ObjectId[];
  stop: Types.ObjectId;
  status: "bar" | "transit" | "waiting" | "limbo"
  lastStatusUpdate: Date;
}

const GroupSchema = new Schema(
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
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  stopsVisited: [
    {
    type: Schema.Types.ObjectId,
    ref: "Stop",
    }
  ],

  groupMembers: [
    {
    type: Schema.Types.ObjectId,
    ref: "Participant",
    }
  ],

  stop: {
    type: Schema.Types.ObjectId,
    ref: "Stop",
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