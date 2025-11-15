import express from "express";
import {
    createUser,
    updateUser,
    getUser,
    deleteUser,
} from "../controllers/user_controller";

const userRouter = express.Router();

userRouter.post("/create", createUser);
userRouter.put("/update", updateUser);
userRouter.get("/get", getUser);
userRouter.delete("/delete", deleteUser);

export default userRouter;