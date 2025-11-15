import express from "express";
import {
    createEvent,
    updateEvent,
    getEventById,
    deleteEvent,
    startEvent,
} from "../controllers/event_controller";

const eventRouter = express.Router();

eventRouter.post("/create", createEvent);
eventRouter.put("/update", updateEvent);
eventRouter.get("/get/:id", getEventById);
eventRouter.delete("/delete", deleteEvent);

eventRouter.post("/start/:id", startEvent);

export default eventRouter;