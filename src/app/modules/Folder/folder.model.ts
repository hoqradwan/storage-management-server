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

FolderSchema.pre('save', async function (next) {
    if (this.isModified('hashedPassword') && this.type === 'private') {
        try {
            // Ensure we hash the password before saving
            if (!this.hashedPassword) {
                return next(new Error('Password is required for private folders'));
            }
            this.hashedPassword = await bcrypt.hash(this.hashedPassword, 10);
        } catch (err) {
            return next(err as Error);
        }
    }
    next();
});

export const Folder = model<IFolder>('Folder', FolderSchema);