import express from "express";
import {
    createStop,
    deleteStop,
    addGroup,
    vacateGroup,
} from "../controllers/stop_controller";

const stopRouter = express.Router();

stopRouter.post("/", createStop);
stopRouter.delete("/:id", deleteStop);

stopRouter.put("/enqueueGroup/:stopID/:groupID", addGroup);
stopRouter.put("/serveGroup/:stopID/:groupID", addGroup);
stopRouter.put("/vacateGroup/:stopID/:groupID", vacateGroup);

export default stopRouter;