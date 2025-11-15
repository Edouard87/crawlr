import express from "express";
import {
    createBar,
    updateBar,
    getBarById,
    deleteBar,
} from "../controllers/bar_controller";
import { authMiddleware } from "src/middleware/auth";

const barRouter = express.Router();

barRouter.post("/", authMiddleware, createBar);
barRouter.put("/:id", updateBar);
barRouter.get("/:id", getBarById);
barRouter.delete("/:id", authMiddleware, deleteBar);

export default barRouter;
