import {Router} from 'express'

import {
    createParticipant,
    getParticipantById,
    updateParticipant,
    deleteParticipant
} from "../controllers/participant_controller";

const router = Router();

router.post("/", createParticipant);
router.get("/", getParticipantById);
router.get("/:id", getParticipantById);
router.put("/:id", updateParticipant);   // or router.patch
router.delete("/:id", deleteParticipant);

export default router;