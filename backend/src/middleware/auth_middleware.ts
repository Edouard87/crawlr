import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
// import { getUser } from '../controllers/users';

// Define the user type for the JWT payload
interface UserPayload extends JwtPayload {
  id: string;
  role: string;
}

// Extend the Express Request interface to include our custom user property
declare global {
  namespace Express {
  interface Request {
    user?: UserPayload;
  }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  req.user = decoded;
  
  next();
  } catch (error) {
  return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};