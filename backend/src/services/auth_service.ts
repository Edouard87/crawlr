import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user';
import { HydratedDocument } from 'mongoose';

export default class AuthService {
  public static async login(email: string, password: string) {
    // Validate input data
    try {
      const user: HydratedDocument<IUser> | null = await UserModel.findOne({email: email})
  
      if (!user) {
      throw new Error('Invalid email or password');
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
      throw new Error('Invalid email or password');
      }
  
      // Generate access token (short-lived)
      const accessToken = this.generateAccessToken(user);
  
      return accessToken
    } catch (error) {
      throw new Error(error);
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