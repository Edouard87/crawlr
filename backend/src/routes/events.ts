import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controller/events";

const router = express.Router();

// Route to get all events
router.get("/", getAllEvents);

// Route to get a specific event by ID
router.get("/:id", getEventById);

// Route to create a new event
router.post("/", createEvent);

// Route to update an event by ID
router.put("/:id", updateEvent);

// Route to delete an event by ID
router.delete("/:id", deleteEvent);

export default router;

