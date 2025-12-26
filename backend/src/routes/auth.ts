import {Router} from 'express'
import AuthController from "../controllers/auth_controller";
import { auth } from 'firebase-admin';
import { authMiddleware } from '../middleware/auth_middleware';

const authRouter = Router();

authRouter.post("/login", AuthController.login);
authRouter.get("/verify", authMiddleware, AuthController.verifyToken);

export default authRouter;