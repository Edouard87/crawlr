import mongoose, { Schema, Document, Types } from "mongoose";

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