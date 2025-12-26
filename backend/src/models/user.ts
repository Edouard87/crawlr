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
  email: { 
    type: String,
    required: [true, "Email is required"],
    unique: true,
    min: [1, "Email must contain at least one character."],
    max: [100, "Maximum email length is 100 characters."],
    validate: [
    {
      validator: async v => {
        const user: IUser | null = await UserModel.findOne({ email: v });
        return !user;
      },
      message: "Email already exists."
    }, {
      validator: v => /\S+@\S+\.\S+/.test(v),
      message: "Email format is invalid."
    }] },

  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    min: [7, "Phone number must contain at least 7 digits."],
    max: [15, "Phone number cannot exceed 15 digits."]
  },

  name: {
    type: String,
    required: [true, "Name is required"],
    min: [1, "Name must contain at least one character."],
    max: [100, "Maximum name length is 100 characters."],
  },

  password: {
    type: String,
    min: [8, "Password must be at least 8 characters long."],
    max: [128, "Password cannot exceed 128 characters."],
    required: [true, "Password is required."]},

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

const UserModel = mongoose.model<IUser>("User", UserSchema);

export { UserModel };
