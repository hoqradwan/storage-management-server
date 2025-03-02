import bcrypt from 'bcrypt';
import { File } from "../File/file.model";
import { Folder } from "./folder.model";


export const getAllFoldersFromDB = async (userId: string) => {
    const result = await Folder.find({ user: userId });
    return result;
}
export const createFolderIntoDB = async (userId: string, payload: {
    name: string;
    type: 'normal' | 'private';
    password?: string;
}) => {
    if (payload.type === 'private' && !payload.password) {
        throw new Error('Password required for private folders');
    }

    return await Folder.create({
        name: payload.name,
        type: payload.type,
        hashedPassword: payload.type === 'private' ? payload.password : undefined,
        user: userId
    });
};
export const addFilesToFolderService = async (
    userId: string,
    folderId: string,
    fileIds: string[],
    password?: string
) => {
    const folder = await Folder.findOne({
        _id: folderId,
        user: userId
    });

    if (!folder) throw new Error('Folder not found');

    // Check password for private folders
    if (folder.type === 'private') {
        if (!password) throw new Error('Password required for private folder');

        const isValid = await bcrypt.compare(password, folder.hashedPassword);
        if (!isValid) throw new Error('Invalid password');
    }

    const files = await File.find({
        _id: { $in: fileIds },
        user: userId
    });

    folder.files.push(...files.map(f => f._id));
    await folder.save();

    return folder;
};

export const getFolderFilesService = async (
    userId: string,
    folderId: string,
    password?: string
) => {
    const folder = await Folder.findOne({ _id: folderId, user: userId })
        .populate('files')
        .lean();

    if (!folder) throw new Error('Folder not found');

    if (folder.type === 'private') {
        if (!password) throw new Error('Password required');
        const isValid = await bcrypt.compare(password, folder.hashedPassword);
        if (!isValid) throw new Error('Invalid password');
    }

    return folder.files;
};

export const deleteFolderService = async (
    userId: string,
    folderId: string
) => {
    const result = await Folder.findOneAndDelete({
        _id: folderId,
        user: userId
    });
    return result;
};