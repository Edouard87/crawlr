import { Request, Response } from "express";
import { BarModel, IBar } from "../models/user";

/**
 * Create a new bar
 */
export const createBar = async (req: Request, res: Response) => {
  try {
    const bar = new BarModel(req.body);
    const savedBar = await bar.save();
    res.status(201).json({
      message: "Bar created successfully",
      id: savedBar._id.toString(),
      bar: savedBar,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create bar",
      error: error.message,
    });
  }
};

/**
 * Get all bars
 */
export const getBars = async (req: Request, res: Response) => {
  try {
    const bars = await BarModel.find();
    res.json(bars);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to get bars",
      error: error.message,
    });
  }
};

/**
 * Get bar by ID
 */
export const getBarById = async (req: Request, res: Response) => {
  try {
    const bar = await BarModel.findById(req.params.id);
    if (!bar) {
      res.status(404).json({ message: "Bar not found" });
      return;
    }
    res.json(bar);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to get bar",
      error: error.message,
    });
  }
};

/**
 * Update bar by ID
 */
export const updateBar = async (req: Request, res: Response) => {
  try {
    const bar = await BarModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bar) {
      res.status(404).json({ message: "Bar not found" });
      return;
    }
    res.json(bar);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update bar",
      error: error.message,
    });
  }
};

/**
 * Delete bar by ID
 */
export const deleteBar = async (req: Request, res: Response) => {
  try {
    const bar = await BarModel.findByIdAndDelete(req.params.id);
    if (!bar) {
      res.status(404).json({ message: "Bar not found" });
      return;
    }
    res.json({ message: "Bar deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete bar",
      error: error.message,
    });
  }
};

