import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStop extends Document {
  bar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bar",
    required: true,
  },
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