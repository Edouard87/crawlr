import express from "express";
import {
  createStop,
  deleteStop,
  enqueueGroup,
  serveGroup,
  //vacateGroup,
} from "../controllers/stop_controller";

const stopRouter = express.Router();

stopRouter.post("/", createStop);
stopRouter.delete("/:id", deleteStop);

stopRouter.put("/enqueueGroup/:stopID/:groupID", enqueueGroup);
stopRouter.put("/serveGroup/:stopID/:groupID", serveGroup);
//stopRouter.put("/vacateGroup/:stopID/:groupID", vacateGroup);

export default stopRouter;