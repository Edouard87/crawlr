import { Request, Response } from "express";
import { EventModel, IEvent } from "../models/event";

export default class EventService {
    /**
     * Create a new event and store it in the MongoDB database.
     * Expects a JSON body with event data.
     */
    public static createEvent = async (eventData: IEvent) => {
        const event = new EventModel(eventData);
        const savedEvent = await event.save();
        return savedEvent
    };
    
    /**
     * Get all events
     */
    public static getAllEvents = async () => {
        const events = await EventModel.find()
            .populate("createdBy", "displayName email")
            .populate("participants", "displayName email")
            .populate("bars", "name address");
        return events
    };
    
    /**
     * Get event by ID
     */
    public static getEventById = async (id: string) => {
        const event = await EventModel.findById(id)
        if (!event) {
            throw new Error("Provided event does not exist.");
        }
        event.populate("createdBy", "displayName email")
        event.populate("participants", "displayName email")
        event.populate("bars", "name address");
        return event;
    };
    
    /**
     * Update event by ID
     */
    public static updateEvent = async (id: string, newContent: IEvent) => {
        const event = await EventModel.findByIdAndUpdate(
            id,
            newContent,
            { new: true, runValidators: true }
        )
            .populate("createdBy", "displayName email")
            .populate("participants", "displayName email")
            .populate("bars", "name address");
            return event
    }
    
    /**
     * Delete event by ID
     */
    public static deleteEvent = async (eventID: string) => {
        const event = await EventModel.findByIdAndDelete(eventID);
        
        if (!event) {
            throw new Error("Cannot delete nonexistant event");
        }
    };
}

