import { Request, Response } from "express";
import GroupService from "src/services/group_service";

export const stop = async (req: Request, res: Response) => {
  try {
    const stop = GroupService.stop(req.body)
    if (stop === null) {
      res.status(404).json({ message: "group not found" })
    }
    res.status(200).json({stop})
  } catch (err) {
    console.error("Error creating participant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};