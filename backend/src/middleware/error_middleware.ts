import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void { 
  // Standardized mechanism of representing different types of errors raised by the application. I prefer
  // relying on internal types rather than defining our own.

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json(
      { message: "Invalid input",
        error: error.message,
        path: error.path,});
      return;
  }

  // If we can't figure out the error, it's a general server error.
  let errorMessage: string;
  if (process.env.NODE_ENV === 'production') {
    errorMessage = 'An unexpected error occurred';
  } else {
    errorMessage = error.message;
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: errorMessage
  });

}