import { Request, Response } from "express";
import { CheckInModel, ICheckIn } from "../utils/schema";

/**
 * Create a new check-in
 */
export const createCheckIn = async (req: Request, res: Response) => {
  try {
    const checkIn = new CheckInModel(req.body);
    const savedCheckIn = await checkIn.save();
    res.status(201).json({
      message: "Check-in created successfully",
      id: savedCheckIn._id.toString(),
      checkIn: savedCheckIn,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create check-in",
      error: error.message,
    });
  }
};

/**
 * Get all check-ins
 */
export const getCheckIns = async (req: Request, res: Response) => {
  try {
    const checkIns = await CheckInModel.find()
      .populate("userId", "displayName email")
      .populate("barId", "name address")
      .populate("crawlId", "name");
    res.json(checkIns);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to get check-ins",
      error: error.message,
    });
  }
};

/**
 * Get check-in by ID
 */
export const getCheckInById = async (req: Request, res: Response) => {
  try {
    const checkIn = await CheckInModel.findById(req.params.id)
      .populate("userId", "displayName email")
      .populate("barId", "name address")
      .populate("crawlId", "name");
    if (!checkIn) {
      res.status(404).json({ message: "Check-in not found" });
      return;
    }
    res.json(checkIn);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to get check-in",
      error: error.message,
    });
  }
};

