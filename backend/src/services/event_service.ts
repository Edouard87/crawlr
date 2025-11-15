import { Request, Response } from "express";
import { EventModel, IEvent } from "../models/event";
import GroupService from "./group_service";

export default class EventService {
    /**
     * Create a new event and store it in the MongoDB database.
     * Expects a JSON body with event data.
     */
    public static createEvent = async (eventname: string, numGroups: number, creatorID: string) => {
        if (!creatorID || creatorID.length === 0) {
            throw new Error("Creator ID must be provided to create an event.");
        }
        const event = await EventModel.create({
            name: eventname,
            createdBy: creatorID,
            participants: [],
            coordinators: [],
            groups: [],
            stops: [],
            status: "planned"
        });

        const groupIDs = await GroupService.initializeGroups(numGroups, event)
        event.groups = groupIDs;
        await event.save();
        return event;
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

