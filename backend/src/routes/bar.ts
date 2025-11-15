import express from "express";
import {
  createBar,
  updateBar,
  getBarById,
  deleteBar,
  getAllBars
} from "../controllers/bar_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const barRouter = express.Router();

barRouter.post("/", authMiddleware, createBar);
barRouter.put("/:id", updateBar);
barRouter.get("/:id", getBarById);
barRouter.delete("/:id", authMiddleware, deleteBar);
barRouter.get("/", getAllBars);

export default barRouter;
