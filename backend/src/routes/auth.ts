import express from "express";
import {
    login,
    logout,
} from "../controllers/auth";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);