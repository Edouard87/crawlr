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
}