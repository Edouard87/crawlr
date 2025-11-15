import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from 'src/models/user';
import { HydratedDocument } from 'mongoose';

public static async function login(email: string, password: string) {
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
      
      // Generate refresh token (long-lived)
      const refreshToken = this.generateRefreshToken(user);

      return {
        "token": accessToken,
        "refreshToken": refreshToken,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to login', error);
    }
  }

  /**
   * Generate a short-lived access token
   */
  public static generateAccessToken(user: User): string {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30m' } // Set to expire in 30 minutes
    );
  }

  /**
   * Generate a long-lived refresh token
   */
  public static generateRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET as string,
      { expiresIn: '7d' } // Set to expire in 7 days
    );
  }

  /**
   * Refresh the access token using a valid refresh token
   */
  public static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET as string
      ) as { id: string };
      
      // Get the user from the database
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.id]
      );
      
      const user: User = result.rows[0];
      
      if (!user) {
        throw new ValidationError('User not found');
      }

      // Generate a new access token
      const accessToken = this.generateAccessToken(user);
      
      return { token: accessToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ValidationError('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ValidationError('Invalid refresh token');
      }
      throw new DatabaseError('Failed to refresh token', error);
    }
  }