import { UserModel, IUser } from "../utils/schema";

export async function createUser(userData: Omit<IUser, "_id" | "createdAt" | "updatedAt">): Promise<string> {
    const user = new UserModel(userData);
    const savedUser = await user.save();
    return savedUser._id.toString();
}

export async function getUser(userId: string): Promise<IUser | null> {
    return await UserModel.findById(userId);
}

export async function updateUser(userId: string, updates: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(userId, updates, { new: true });
}

export async function deleteUser(userId: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(userId);
    return result !== null;
}