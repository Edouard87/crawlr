import { Request, Response } from "express";
import { collection, addDoc } from "firebase/firestore";
import db from "../utils/db";

/**
 * Create a new event and store it in the Firestore database.
 * Expects a JSON body with event data.
 */
export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventData = req.body;

    // Optionally: Validate eventData here

    const docRef = await addDoc(collection(db, "events"), eventData);
    res.status(201).json({
      message: "Event created successfully",
      id: docRef.id,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create event",
      error: error.message,
    });
  }
};
//
// Optionally, you could set up an Express route here:
// import express from "express";
// const router = express.Router();
// router.post("/", createEvent);
// export default router;
