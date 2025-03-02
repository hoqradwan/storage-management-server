import { Document, Types } from 'mongoose';

export interface IFile extends Document {
    name: string;
    type: 'note' | 'image' | 'pdf';
    size: number;
    path: string;
    isFavorite: boolean;
    user: Types.ObjectId;
}

// export interface IStorage extends Document {
//     user: string;
//     usedStorage: number;
// }