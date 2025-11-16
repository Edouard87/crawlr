import { Request, Response } from "express";
import { EventModel, IEvent } from "../models/event";
import GroupService from "./group_service";
import { Document, Types } from "mongoose";
import { StopModel } from "../models/stop" 

export default class EventService {
    /**
     * Create a new event and store it in the MongoDB database.
     * Expects a JSON body with event data.
     */
    public static createEvent = async (eventname: string, numGroups: number, creatorID: string, stops: [string]) => {
        if (!creatorID || creatorID.length === 0) {
            throw new Error("Creator ID must be provided to create an event.");
        }
        const event = await EventModel.create({
            name: eventname,
            createdBy: creatorID,
            participants: [],
            coordinators: [],
            groups: [],
            stops: stops,
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
            .populate("stops", "name address");
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
    public static updateEvent = async (id: string, newContent) => {
        const event = await EventModel.findByIdAndUpdate(
            id,
            {
                stops: newContent
            },
            { new: true, runValidators: true }
        )
            .populate("createdBy", "displayName email")
            .populate("participants", "displayName email");
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

    public static joinEvent = async (eventCode: string) => {
        const event = await EventModel.findOne({ signInCode: eventCode }).populate("groups")
        if (!event) {
            throw new Error("Invalid Code");
        }
        return event.groups
    }

    public static getEventByCode = async (coordCode: string) => {
        // Get the bars associated with the event.
        // At the same time verifies that the provided coord code is valid.
        const doc: Document = await EventModel.findOne({ coordinatorCode:  coordCode }).populate({
            path: "stops",
            populate: [
                { path: "bar"}
            ]
        })
        if (!doc) {
            throw new Error("Invalid Code");
        }
        const event: IEvent = doc.toObject() as IEvent;
        const bars = []
        event.stops.forEach((stopID: Types.ObjectId) => {
            // @ts-ignore
            bars.push(stopID.bar)
        })
        // DO NOT RETURN ALL DATA ABOUT THE EVENT AS THIS IS INSECURE.
        return {
            _id: event._id,
            stops: event.stops,
            bars,
            name: event.name,
            status: event.status,
        }
    }

    public static startEvent = async (eventId: string) => {
        const event: IEvent = await EventModel.findById(eventId)
        if (!event) throw new Error('Event not found')
        if (event.status === "active") throw new Error("Event has already been started")
        if (event.groups.length == 0) throw new Error("Event must have at least one team to be started.")

        const stops = await StopModel.find({ _id: { $in: event.stops }})
        let stopIndex = 0

        // iterate values, not keys
        for (const group of event.groups) {
            // if group is a string but your schema expects ObjectId, convert:
            // const groupId = typeof group === 'string' ? new Types.ObjectId(group) : group
            stops[stopIndex % stops.length].inTransitGroups.push(group)
            stopIndex++
        }

        // persist changes
        await Promise.all(stops.map(s => s.save()))
        // event.status = "active"
        event.save();
    }
}

