import { Request, Response, NextFunction } from 'express';
import mongoose, { Model } from 'mongoose';

export default function inputValidationMiddlewareFactory(model: Model<any>) { 
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await model.validate(req.body)
      } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        // Validation failed for the provided model.
        res.status(400).json({ message: "Validation error", errors: err.errors });
        res.end();
        return;
      } else {
        res.status(500).json({ message: "Internal server error" });
        res.end()
        return;
      };
    }
    next();
  }
}