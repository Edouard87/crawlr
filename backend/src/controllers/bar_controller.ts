import { Request, Response } from "express";
import { BarModel, IBar } from "../models/bar";
import BarService from "../services/bar_service"

/**
 * Create a new bar
 */
export const createBar = async (req: Request, res: Response) => {
  try {
    const savedBar = await BarService.createBar(req.body)
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
export const getAllBars = async (req: Request, res: Response) => {
  try {
    const bars = await BarService.getAllBars();
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
    const bar = await BarService.getBarById(req.body.id);
    if (!bar) {
      return res.status(404).json({ message: "Bar not found" });
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
    const updatedBar = await BarService.updateBar(req.params.id, req.body);
    if (!updatedBar) {
      return res.status(404).json({ message: "Bar not found" });
    }
    res.json({
      message: "Bar updated successfully",
      bar: updatedBar
    });
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
    const deletedBar = await BarService.deleteBar(req.params.id);
    if (!deletedBar) {
      return res.status(404).json({ message: "Bar not found" });
    }
    res.json({
      message: "Bar deleted successfully"
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete bar",
      error: error.message,
    });
  }
};

