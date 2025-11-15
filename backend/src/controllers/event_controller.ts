import { Request, Response } from "express";
import { EventModel, IEvent } from "../models/user";

/**
 * Create a new event and store it in the MongoDB database.
 * Expects a JSON body with event data.
 */
export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    const event = new EventModel(eventData);
    const savedEvent = await event.save();
    
    res.status(201).json({
      message: "Event created successfully",
      id: savedEvent._id.toString(),
      event: savedEvent,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create event",
      error: error.message,
    });
  }
};

/**
 * Get all events
 */
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await EventModel.find()
      .populate("createdBy", "displayName email")
      .populate("participants", "displayName email")
      .populate("bars", "name address");
    
    res.json(events);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to get events",
      error: error.message,
    });
  }
};

/**
 * Get event by ID
 */
export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await EventModel.findById(req.params.id)
      .populate("createdBy", "displayName email")
      .populate("participants", "displayName email")
      .populate("bars", "name address");
    
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    
    res.json(event);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to get event",
      error: error.message,
    });
  }
};

/**
 * Update event by ID
 */
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await EventModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "displayName email")
      .populate("participants", "displayName email")
      .populate("bars", "name address");
    
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    
    res.json(event);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update event",
      error: error.message,
    });
  }
};

/**
 * Delete event by ID
 */
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await EventModel.findByIdAndDelete(req.params.id);
    
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    
    res.json({ message: "Event deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete event",
      error: error.message,
    });
  }
};
