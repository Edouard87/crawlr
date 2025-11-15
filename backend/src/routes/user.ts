import express from "express";
import {
  createUser,
  updateUser,
  getUser,
  deleteUser,
} from "../controllers/user_controller";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.put("/:id", updateUser);
userRouter.get("/:id", getUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;