import { IEvent } from "src/models/event";
import { GroupModel, IGroup } from "../models/group";
import { IStop } from "../models/stop";

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

  public static getAllGroupsForEvent = async (eventId: string) => {
    const groups = await GroupModel.find({ event: eventId });
    return groups;
  }
}