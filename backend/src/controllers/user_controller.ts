import { Request, Response, Router } from "express";
import { UserModel } from "../models/user";
import bcrypt from 'bcrypt';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber, password, name } = req.body;

    if (!email || !phoneNumber || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      phoneNumber,
      hashedPassword,
      name,
      eventsCreated: [],
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return res.status(201).json(userObj);
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, phoneNumber, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const update: any = {};
    if (email !== undefined) update.email = email;
    if (phoneNumber !== undefined) update.phoneNumber = phoneNumber;
    if (name !== undefined) update.name = name;
    if (password !== undefined) update.password = hashedPassword;

    const user = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(204).send(); // no content
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};