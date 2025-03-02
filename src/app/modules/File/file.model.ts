import { Schema, model } from 'mongoose';
import { IFile } from './file.interface';
import { formatFileSize } from './file.utils';

const FileSchema = new Schema<IFile>({
    name: { type: String, required: true },
    type: { type: String, enum: ['note', 'image', 'pdf'], required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isFavorite: { type: Boolean, default: false },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});
FileSchema.virtual('formattedSize').get(function () {
    return formatFileSize(this.size);
});
export const File = model<IFile>('File', FileSchema);