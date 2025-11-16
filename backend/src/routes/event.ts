import express from "express";
import {
  createEvent,
  updateEvent,
  getEventById,
  deleteEvent,
  joinEvent,
  getAllEvents, 
  getEventByCoordCode
  //startEvent,
} from "../controllers/event_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const eventRouter = express.Router();

eventRouter.post("/", authMiddleware, createEvent);
eventRouter.put("/:id", authMiddleware, updateEvent);
eventRouter.get("/:id", authMiddleware, getEventById);
eventRouter.delete("/:id", authMiddleware, deleteEvent);
eventRouter.get("/", authMiddleware, getAllEvents);

// TODO: This method should probably be protected.
eventRouter.get("/code/:coordCode", getEventByCoordCode);

eventRouter.post("/join/:eventCode", joinEvent);

// TODO: eventRouter.post("/start/:id", startEvent);

export default eventRouter;