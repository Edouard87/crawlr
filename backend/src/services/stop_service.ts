import { HydratedDocument, Types } from "mongoose";
import { GroupModel } from "../models/group";
import { StopModel, IStop } from "../models/stop";
import { IEvent } from "src/models/event";
import { IBar } from "src/models/bar";
import { start } from "node:repl";
import GroupService from "./group_service";

export default class StopService {
  public static createStop = async (stopData) => {
    const stop = new StopModel(stopData);
    const savedStop = await stop.save();
    return savedStop
  };

  public static deleteStop = async (id: string) => {
    return await StopModel.findByIdAndDelete(id);
  };

  public static enqueueGroup = async (stopID: string, groupID: string) => {
    const stop = await StopModel.findById(stopID)
      .populate("currentGroups")
      .populate("waitingGroups");
    if (stop === null) {
      throw new Error("stop not found");
    }

    const group = await GroupModel.findById(groupID);
    if (group === null) {
      throw new Error("group not found");
    }

    // TODO: use sessions, mongo replica set?
    if (stop.currentGroups.length === 0) {
      stop.currentGroups.push(new Types.ObjectId(groupID));
      group.status = "bar";
      group.stop = new Types.ObjectId(stopID);
      group.lastStatusUpdate = new Date();
      await group.save();
    } else {
      stop.waitingGroups.push(new Types.ObjectId(groupID));
      group.status = "waiting";
      group.stop = new Types.ObjectId(stopID);
      group.lastStatusUpdate = new Date();
      await group.save();
    }
    return await stop.save();
  };

  public static serveGroup = async (stopID: string) => {
    const stop = await StopModel.findById(stopID)
      .populate("currentGroups")
      .populate("waitingGroups");
    if (stop === null) {
      throw new Error("stop not found");
    }

    if (stop.waitingGroups.length === 0) {
      return null
    }
    const groupID = stop.waitingGroups.shift();
    const group = await GroupModel.findById(groupID);
    if (group === null) {
      throw new Error("group not found");
    }
    group.status = "bar";
    group.lastStatusUpdate = new Date();
    await group.save();
    stop.currentGroups.push(groupID);
    return await stop.save();
  }

  public static vacateGroup = async (stopID: string, groupID: string) => {
    const stop = await StopModel.findById(stopID)
      .populate("currentGroups")
      .populate("waitingGroups");
    if (stop === null) {
      throw new Error("stop not found");
    }

    const groupIDs = stop.waitingGroups;
    if (!groupIDs.includes(new Types.ObjectId(groupID))) {
      throw new Error("group not being served");
    }
    const updatedServingIDs = groupIDs.filter(x => x !== new Types.ObjectId(groupID));
    stop.currentGroups = updatedServingIDs;
    StopService.findNextStop(groupID).catch(
      (err: Error) => {
        console.error("Background error:", err)
      }
    )
    return await stop.save();
  }

  // TODO: dynamic time to different bars, google spam
  public static findNextStop = async (groupID: string) => {
    const group = await GroupModel.findById(groupID)
      .populate("stopsVisited")
      .populate("stop")
      .populate({
        path: "event",
        populate: { path: "stops"}
      });
    
    const stopsVisited = group.stopsVisited;
    const event = group.event as IEvent;
    const scores = new Map<Types.ObjectId, number>;
    for (let i = 0; i < event.stops.length; i++) {
      const visitedIndex = stopsVisited.findIndex(
        x => x.equals(event.stops[i])
      )
      if (visitedIndex === -1) {
        const startingStop = await StopModel.findById(group.stop);
        const destinationStop = await StopModel.findById(event.stops[i]);

        if (!startingStop || !destinationStop) {
          throw new Error("Stop not found");
        }

        let score = await StopService.scoreStop(startingStop, destinationStop)
        scores.set(event.stops[i], score)
      }
    }
    const lowest = [...scores.entries()]
      .reduce((a, b) => (a[1] < b[1] ? a : b));

    GroupService.addNextStop()
  }

  public static scoreStop = async (startingStop: IStop, destinationStop: IStop) => {
    const travelTime = await StopService.travelTime(startingStop, destinationStop);
    const waitTimeAtStop = await StopService.waitTime(destinationStop);
    return Math.max(travelTime, waitTimeAtStop);
  }

  // TODO: Config file to hold arbitrary values
  public static waitTime = async (destinationStop: IStop) => {
    await destinationStop.populate([
      { path: "currentGroups" }
    ]);
    let timeToDepart = 5;
    for (let i = 0; i < destinationStop.currentGroups.length; i++) {
      const group = await GroupModel.findById(destinationStop.currentGroups[i]);
      const now = new Date();
      const timeUntilReady = 10 - Math.round((now.getTime() - group.lastStatusUpdate.getTime()) / 1000 / 60 );
      timeToDepart = Math.max(timeToDepart, timeUntilReady)
    }
    timeToDepart += destinationStop.waitingGroups.length * 10
    return timeToDepart
  }

  public static travelTime = async (startingStop: IStop, destinationStop: IStop) => {
    await startingStop.populate("bar");
    await destinationStop.populate("bar");
    const startingBar = startingStop.bar as unknown as IBar;
    const destinationBar = startingStop.bar as unknown as IBar;

    const distanceMeters = haversineDistance(
      startingBar.address.coordinates.latitude,
      startingBar.address.coordinates.longitude,
      destinationBar.address.coordinates.latitude,
      destinationBar.address.coordinates.longitude,
    )
    // TODO: Config? Assume 5km/h walking speed
    return (distanceMeters / 1000 / 5) * 60
  }
}