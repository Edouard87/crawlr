import express from "express";
import {
    createParticipant,
    changeGroup,
} from "../controllers/participant_controller";

const participantRouter = express.Router();

participantRouter.post("/", createParticipant);
participantRouter.put("/changeGroup", changeGroup);

export default participantRouter;