import { Request, Response, Router } from "express";
import { ParticipantModel } from "../models/participant";
import ParticipantService from "../services/participant_service"

// Create participant, reference group
export const createParticipant = async (req: Request, res: Response) => {
  try {
    
    const participant = await ParticipantService.createParticipant(req.body);

    return res.status(201).json(participant);
  } catch (err) {

    return res.status(500).json({ message: "Internal server error" });
    
  }
};

// Get participant by event
export const getParticipantsByGroup = async (_req: Request, res: Response) => {
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
export const getParticipantById = async (req: Request, res: Response) => {
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
export const updateParticipant = async (req: Request, res: Response) => {
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
export const deleteParticipant = async (req: Request, res: Response) => {
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

// Optional router for convenience

