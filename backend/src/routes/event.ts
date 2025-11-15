import express from "express";
import {
  createEvent,
  updateEvent,
  getEventById,
  deleteEvent,
  //startEvent,
} from "../controllers/event_controller";
import { authMiddleware } from "src/middleware/auth_middleware";

const eventRouter = express.Router();

eventRouter.post("/", authMiddleware, createEvent);
eventRouter.put("/:id", authMiddleware, updateEvent);
eventRouter.get("/:id", getEventById);
eventRouter.delete("/:id", authMiddleware, deleteEvent);

//eventRouter.post("/start/:id", startEvent);

export default eventRouter;