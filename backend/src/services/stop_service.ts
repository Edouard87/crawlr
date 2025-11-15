import { HydratedDocument, Types } from "mongoose";
import { GroupModel } from "src/models/group";
import { StopModel, IStop } from "src/models/stop";

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

  }
}