import { Types } from "mongoose";

export interface IFolder {
    name: string;
    type: "normal" | "private";
    hashedPassword?: string;
    user: Types.ObjectId;
    files?: Types.ObjectId[];
}
