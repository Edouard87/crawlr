import { Request, Response, Router } from "express";
import { ParticipantModel } from "../models/participant";
import { StopModel } from "../models/stop";
import { HydratedDocument } from "mongoose";
import { IEvent } from '../models/event'
import { GroupModel } from "../models/group";

interface IParticipantData {
    signInCode: string;
    name: string;
    phoneNumber: string;
    group: string;
    stopAssigned: string;
}

interface ICoordData  {
    coordinatorCode: string;
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

    public static createCoord = async (coordData: ICoordData) => {
        let { name, phoneNumber, stopAssigned } = coordData

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

        // Can only create coordinator if the event code is correct.
        if (coordData.coordinatorCode !== event.signInCode) {
            throw new Error("Invalid sign in code")
        }

        const participant = await ParticipantModel.create({
            name,
            phoneNumber,
            isCoordinator: true,
            stopAssigned: stop._id,
        });

        return participant
    }
  
    // Get participant by group
    public static getParticipantsByGroup = async (groupID: string) => {
        const group = await GroupModel.findById(groupID).populate("groupMembers");
        return group.groupMembers;
    };
  
    // READ ONE  (GET /participants/:id)
    public static getParticipantById = async (id: string) => {
      const participant = await ParticipantModel.findById(id)
        .populate("group")
        .populate("stopAssigned");

        if (!participant) {
          throw new Error("No participant found.")
        }
    };
  
  // UPDATE  (PUT/PATCH /participants/:id)
    public static updateParticipant = async (id: string, newBody) => {
      const { name, phoneNumber, group, isCoordinator, stopAssigned } = newBody;

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
        throw new Error("No participant exists.")
      }
    };
  
  // DELETE  (DELETE /participants/:id)
    public static deleteParticipant = async (id: string) => {
    
        const participant = await ParticipantModel.findByIdAndDelete(id);
        if (!participant) {
            throw new Error("No such participant.")
        }
        
    };
}


