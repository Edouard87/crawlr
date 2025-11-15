import express from "express";
import {
  stop,
} from "../controllers/group_controller";

const groupRouter = express.Router();

groupRouter.get("/stop", stop);

export default groupRouter;