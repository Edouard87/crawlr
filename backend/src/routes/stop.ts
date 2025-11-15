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

stopRouter.put("/addGroup/:id", addGroup);
stopRouter.put("/vacateGroup/:id", vacateGroup);

export default stopRouter;