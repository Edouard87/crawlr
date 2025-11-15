import express from "express";
import {
    nextStop,
} from "../controllers/group_controller";

const groupRouter = express.Router();

groupRouter.get("/nextStop", nextStop);

export default groupRouter;