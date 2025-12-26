import { IEvent } from "src/models/event";
import { GroupModel, IGroup } from "../models/group";
import { IStop, StopModel } from "../models/stop";
import { Types } from "mongoose";

export default class GroupService {
  // Get stop for participant display
  public static stop = async (id: string) => {
    const group = await GroupModel.findById(id)
      .populate<{ stop: IStop }>("stop");
    if (group === null) {
      return null;
    }
    return group.stop;
  }

  public static initializeGroups = async (numGroups: number, event: IEvent) => {
    let groupIDs = []
    for (let i = 0; i < numGroups; i++) {
        let newGroup = await GroupModel.create({
            number: i+1,
            name: "Group " + (i+1),
            event: event._id,
            status: "limbo",
            lastStatusUpdate: new Date(),
        })
        groupIDs.push(newGroup._id)
    }
    return groupIDs
  }

  public static addNextStop = async (groupID: string, stopID: Types.ObjectId) => {
    const group = await GroupModel.findByIdAndUpdate(groupID, {
      status: "transit",
      stop: new Types.ObjectId(stopID),
      lastStatusUpdate: new Date()
    })
    const stop = await StopModel.findById(stopID);
    stop.inTransitGroups.push(new Types.ObjectId(stopID));
    stop.save();
  }
}