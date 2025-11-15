import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStop extends Document {
  bar: Types.ObjectId;
  event: Types.ObjectId;
  currentGroups: Types.ObjectId[];
  waitingGroups: Types.ObjectId[];
  inTransitGroups: Types.ObjectId[];
}

const StopSchema = new mongoose.Schema(
  {
    bar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bar",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    currentGroup: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Group",
        }
      ],
      default: [],
    },

    waitingGroups: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Group",
        }
      ],
      default: [],
    },

    inTransitGroups: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Group",
        }
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const StopModel = mongoose.model<IStop>("Stop", StopSchema);