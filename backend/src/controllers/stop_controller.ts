import { Request, Response } from "express";
import StopService from "../services/stop_service";

export const createStop = async (req: Request, res: Response) => {
  try {
  const stop = await StopService.createStop(req.body);
  res.status(201).json({
    message: "Stop created successfully",
    id: stop._id.toString(),
    stop: stop,
  });
  } catch (err) {
  console.error("Error creating stop:", err);
  return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteStop = async (req: Request, res: Response) => {
  try {
  const stop = await StopService.deleteStop(req.params.stopID);
  res.status(200);
  } catch (err) {
  console.error("Error deleting stop:", err);
  return res.status(500).json({ message: "Internal server error" });
  }
};

export const enqueueGroup = async (req: Request, res: Response) => {
  try {
  const stop = await StopService.enqueueGroup(req.params.stopID, req.params.groupID);
  res.status(200).json({
    message: "Group enqueued successfully",
    id: stop._id.toString(),
    stop: stop,
  });
  } catch (err) {
    console.error("Error enqueueing group:", err);
    return res.status(500).json({ 
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const serveGroup = async (req: Request, res: Response) => {
  try {
  const stop = await StopService.serveGroup(req.params.stopID);
  res.status(200).json({
    message: "Group served successfully",
    id: stop._id.toString(),
    stop: stop,
  });
  } catch (err) {
  console.error("Error serving group:", err);
  return res.status(500).json({ 
    message: "Internal server error",
    err: err.message,
  });
  }
};

export const vacateGroup = async (req: Request, res: Response) => {
  try {
    const stop = await StopService.vacateGroup(req.params.stopID, req.params.groupID);
    res.status(200).json({
      message: "Group vacated successfully",
      id: stop._id.toString(),
      stop: stop,
    });
  } catch (err) {
    console.error("Error vacating group:", err);
    return res.status(500).json({ 
      message: "Internal server error",
      err: err.message,
    })
  }
}

export const getStopById = async (req: Request, res: Response) => {
  const stop = await StopService.getStopById(req.params.id);
  res.status(200).json(stop);
};