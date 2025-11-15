import mongoose, { Schema, Document, Types } from "mongoose";

// Account holder -> event creator
export interface IUser extends Document {
  email: string;
  phoneNumber: string;
  password: string;
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