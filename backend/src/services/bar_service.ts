import { Request, Response } from "express";
import { BarModel, IBar } from "../models/bar";

export default class BarService {
  /**
   * Create a new bar
   */
  public static createBar = async (barData) => {
    const bar = new BarModel(barData);
    const savedBar = await bar.save();
    return savedBar
  };

  public static getAllBars = async () => {
    return await BarModel.find();
  }

  public static getBarById = async (id: string) => {
    return await BarModel.findById(id);
  }

  public static updateBar = async (id: string, body) => {
    return await BarModel.findByIdAndUpdate(id, body, { new: true })
  }

  public static deleteBar = async (id: string) => {
    return await BarModel.findByIdAndDelete(id);
  }
} 