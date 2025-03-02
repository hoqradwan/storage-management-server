import { Schema, model } from 'mongoose';
import { IFile } from './file.interface';

const FileSchema = new Schema<IFile>({
    name: { type: String, required: true },
    type: { type: String, enum: ['note', 'image', 'pdf'], required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

export const File = model<IFile>('File', FileSchema);