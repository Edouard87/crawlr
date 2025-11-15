import { Request, Response, Router } from "express";
import { ParticipantModel } from "../models/participant";
import { StopModel } from "src/models/stop";
import { HydratedDocument } from "mongoose";
import { IEvent } from '../models/event'
import { GroupModel } from "src/models/group";

interface IParticipantData {
    signInCode: string;
    name: string;
    phoneNumber: string;
    group: string;
    stopAssigned: string;
}

export default class ParticipantService {
    // Create participant, reference group
    // need to come with a group 
    // Allows the participant to join a group with a provided ID.
    public static createParticipant = async (participantData: IParticipantData) => {
        try {
        const { name, phoneNumber, group, stopAssigned } = participantData;
    
        if (!name || !phoneNumber) {
            throw new Error("Missing required fields");
        }

        if (!stopAssigned) {
            throw new Error("Participant must be assigned to a stop.")
        }

        const stop = await StopModel.findById(stopAssigned).populate<{ event: IEvent }>("event");
        
        if (!stop) {
            throw new Error("Stop not found");
        }

        const event = stop.event as HydratedDocument<IEvent> | null;

        if (!event) {
            throw new Error("Stop not currently assigned to an event.")
        }

        if (participantData.signInCode !== event.signInCode) {
            throw new Error("Invalid sign in code")
        }

        let groupDoc = await GroupModel.findById(group);

        if (!groupDoc) {
            throw new Error("Group does not exist.");
        }
        
        // Assign the participant to the provided stop.
        const participant = await ParticipantModel.create({
            name,
            phoneNumber,
            group,
            isCoordinator: false,
            stopAssigned: stop._id,
        });
    
        return await participant.populate("group");
        
        } catch (err) {

            throw new Error("Error creating participants.");
            
        }
    };
  
    // Get participant by event
    public static getParticipantsByGroup = async (_req: Request, res: Response) => {
        try {
        const participants = await ParticipantModel.find()
            .populate("group")
            .populate("stopAssigned");
    
        return res.status(200).json(participants);
        } catch (err) {
        console.error("Error fetching participants:", err);
        return res.status(500).json({ message: "Internal server error" });
        }
    };
  
    // READ ONE  (GET /participants/:id)
    public static getParticipantById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const participant = await ParticipantModel.findById(id)
        .populate("group")
        .populate("stopAssigned");

        if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
        }

        return res.status(200).json(participant);
    } catch (err) {
        console.error("Error fetching participant:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
    };
  
  // UPDATE  (PUT/PATCH /participants/:id)
    public static updateParticipant = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, phoneNumber, group, isCoordinator, stopAssigned } = req.body;

        const update: any = {};
        if (name !== undefined) update.name = name;
        if (phoneNumber !== undefined) update.phoneNumber = phoneNumber;
        if (group !== undefined) update.group = group;
        if (typeof isCoordinator === "boolean") update.isCoordinator = isCoordinator;
        if (stopAssigned !== undefined) update.stopAssigned = stopAssigned;

        const participant = await ParticipantModel.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
        })
        .populate("group")
        .populate("stopAssigned");

        if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
        }

        return res.status(200).json(participant);
    } catch (err) {
        console.error("Error updating participant:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
    };
  
  // DELETE  (DELETE /participants/:id)
    public static deleteParticipant = async (req: Request, res: Response) => {
        try {
        const { id } = req.params;
    
        const participant = await ParticipantModel.findByIdAndDelete(id);
        if (!participant) {
            return res.status(404).json({ message: "Participant not found" });
        }
    
        return res.status(204).send();
        } catch (err) {
        console.error("Error deleting participant:", err);
        return res.status(500).json({ message: "Internal server error" });
        }
    };
}


