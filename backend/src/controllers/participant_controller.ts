import { Request, Response, Router } from "express";
import { ParticipantModel } from "../models/participant";
import ParticipantService from "../services/participant_service"

// Create participant, reference group
export const createParticipant = async (req: Request, res: Response) => {
  
  const participant = await ParticipantService.createParticipant(req.body);

  return res.status(201).json(participant);
};

// Verify join password and create coord
export const createCoord = async (req: Request, res: Response) => {
  try {
    let coord = ParticipantService.createCoord(req.body.data);
    res.json(coord).status(200);
  } catch(err) {
    res.status(400);
  }
}

// Get participant by event
export const getParticipantsByGroup = async (req: Request, res: Response) => {
  try {
  const participants = ParticipantService.getParticipantById(req.params.id);

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

  const participant = await ParticipantService.getParticipantById(req.params.id)

  return res.status(200).json(participant);
  } catch (err) {
  console.error("Error fetching participant:", err);
  return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE  (PUT/PATCH /participants/:id)
export const updateParticipant = async (req: Request, res: Response) => {
  try {

  const participant = ParticipantService.updateParticipant(req.params.id, req.body)

  return res.status(200).json(participant);
  } catch (err) {
  console.error("Error updating participant:", err);
  return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE  (DELETE /participants/:id)
export const deleteParticipant = async (req: Request, res: Response) => {
  try {

  const participant = await ParticipantService.deleteParticipant(req.params.id)

  return res.status(204).send();
  } catch (err) {
  console.error("Error deleting participant:", err);
  return res.status(500).json({ message: "Internal server error" });
  }
};

