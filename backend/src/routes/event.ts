import express from "express";
import {
  createEvent,
  updateEvent,
  getEventById,
  deleteEvent,
  //startEvent,
} from "../controllers/event_controller";

const eventRouter = express.Router();

eventRouter.post("/", createEvent);
eventRouter.put("/:id", updateEvent);
eventRouter.get("/:id", getEventById);
eventRouter.delete("/:id", deleteEvent);

//eventRouter.post("/start/:id", startEvent);

export default eventRouter;