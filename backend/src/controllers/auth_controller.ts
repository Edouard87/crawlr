import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/user';
import AuthService from '../services/auth_service'

export default class AuthController {
  public static async login(req: Request, res: Response) {
    try {
      const token = await AuthService.login(req.body.email, req.body.password)
      res.send(token)
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Invalid email or password' })
    }
  }
  
    /**
     * Generate a short-lived access token
     */
    public static async generateAccessToken(user: IUser): Promise<string> {
    return jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET as string
    );
  }
}