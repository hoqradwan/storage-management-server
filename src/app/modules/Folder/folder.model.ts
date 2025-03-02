// folder.model.ts
import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IFolder } from './folder.interface';

const FolderSchema = new Schema<IFolder>({
    name: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['normal', 'private'],
        default: 'normal'
    },
    hashedPassword: {
        type: String,
        required: function () {
            return this.type === 'private';
        }
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    files: [{ type: Schema.Types.ObjectId, ref: 'File', default: [] }]
}, { timestamps: true });

// Hash password for private folders
FolderSchema.pre('save', async function (next) {
    if (this.isModified('hashedPassword') && this.type === 'private') {
        this.hashedPassword = bcrypt.hash(this.hashedPassword, 10);
    }
    next();
});

export const Folder = model<IFolder>('Folder', FolderSchema);