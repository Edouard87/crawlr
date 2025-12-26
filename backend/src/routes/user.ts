import express from "express";
import {
  createUser,
  updateUser,
  getUser,
  deleteUser,
} from "../controllers/user_controller";
import inputValidationMiddlewareFactory from "../middleware/input_validation_middleware";
import { UserModel } from "../models/user";

const userRouter = express.Router();

userRouter.post("/", inputValidationMiddlewareFactory(UserModel), createUser);
userRouter.put("/:id", inputValidationMiddlewareFactory(UserModel), updateUser);
userRouter.get("/:id", getUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;