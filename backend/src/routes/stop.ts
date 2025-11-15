import express from "express";
import {
    createStop,
    deleteStop,
    addGroup,
    vacateGroup,
} from "../controllers/stop_controller";

const stopRouter = express.Router();

stopRouter.post("/create", createStop);
stopRouter.delete("/delete", deleteStop);

stopRouter.put("/addGroup", addGroup);
stopRouter.put("/vacateGroup", vacateGroup);

export default stopRouter;