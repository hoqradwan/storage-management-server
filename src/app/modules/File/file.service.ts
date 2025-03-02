import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { User } from '../User/user.model';
import { File } from './file.model';
import { formatFileSize } from './file.utils';
import mongoose from 'mongoose';
const MAX_STORAGE = parseInt(process.env.MAX_STORAGE!);

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const userId = req.user.id;
        const dir = path.join(__dirname, '../../uploads', userId);
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
        cb(null, uniqueName);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max per file
});

export const uploadFileIntoDB = async (req: Request, res: Response) => {
    const file = req.file!;
    const user = await User.findById(req.user.id);

    if (user!.usedStorage + file.size > MAX_STORAGE) {
        await fs.unlink(file.path);
        return res.status(400).json({ message: 'Storage limit exceeded' });
    }

    const newFile = await File.create({
        name: file.originalname,
        type: file.mimetype.startsWith('image/') ? 'image' :
            file.mimetype === 'application/pdf' ? 'pdf' : 'note',
        size: file.size,
        path: file.path,
        user: req.user.id
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { usedStorage: file.size } });

    return newFile;

};


export const getAllFilesFromDB = async (userId: string, query: any) => {
    const filter: any = { user: userId };

    // Add type filter if specified
    if (query.type) {
        const validTypes = ['image', 'pdf', 'note'];
        if (!validTypes.includes(query.type)) {
            throw new Error('Invalid file type filter');
        }
        filter.type = query.type;
    }

    // Add pagination
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
        File.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        File.countDocuments(filter)
    ]);

    return {
        files,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const deleteFileFromDB = async (userId: string, fileId: string) => {
    const file = await File.findOne({ _id: fileId, user: userId });
    if (!file) throw new Error('File not found');

    try { await fs.unlink(file.path); }
    catch (err) { console.error('Failed to delete file:', err); }

    await File.deleteOne({ _id: fileId, user: userId });
    await User.findByIdAndUpdate(userId, { $inc: { usedStorage: -file.size } });

    return file;
};



export const renameFileInDB = async (userId: string, fileId: string, newName: string) => {
    const file = await File.findOneAndUpdate(
        { _id: fileId, user: userId },
        { name: newName },
        { new: true }
    );
    if (!file) throw new Error('File not found');
    return file;
};

export const duplicateFileInDB = async (userId: string, fileId: string) => {
    const originalFile = await File.findOne({ _id: fileId, user: userId });
    if (!originalFile) throw new Error('File not found');

    const user = await User.findById(userId);
    if (!user || user.usedStorage + originalFile.size > MAX_STORAGE)
        throw new Error('Storage limit exceeded');

    const ext = path.extname(originalFile.name);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
    const newPath = path.join(path.dirname(originalFile.path), uniqueName);

    await fs.copyFile(originalFile.path, newPath);

    const newFile = await File.create({
        name: `${originalFile.name}_Copy`,
        type: originalFile.type,
        size: originalFile.size,
        path: newPath,
        user: userId,
    });

    await User.findByIdAndUpdate(userId, { $inc: { usedStorage: originalFile.size } });
    return newFile;
};

export const toggleFavoriteInDB = async (userId: string, fileId: string) => {
    const file = await File.findOne({ _id: fileId, user: userId });
    if (!file) throw new Error('File not found');

    file.isFavorite = !file.isFavorite;
    await file.save();
    return file;
};


export const getStorageSummaryFromDB = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Convert userId to ObjectId for proper matching
    const breakdown = await File.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId)  // Convert string to ObjectId
            }
        },
        {
            $group: {
                _id: '$type',
                totalBytes: { $sum: '$size' },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                type: '$_id',
                totalBytes: 1,
                count: 1,
                _id: 0
            }
        }
    ]);

    return {
        usedStorage: formatFileSize(user.usedStorage),
        remainingStorage: formatFileSize(MAX_STORAGE - user.usedStorage),
        storageLimit: formatFileSize(MAX_STORAGE),
        breakdown: breakdown.map(item => ({
            ...item,
            formattedTotal: formatFileSize(item.totalBytes),
        }))
    };
};

export const getRecentFilesFromDB = async (userId: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await File.find({
        user: userId,
        createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });
};

export const getFilesByDateFromDB = async (userId: string, dateString: string) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error('Valid date parameter (YYYY-MM-DD) is required');
    }

    // Parse date in UTC context
    const [year, month, day] = dateString.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day));
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 1);

    return await File.find({
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lt: endDate }
    })
        .sort({ createdAt: -1 })
        .lean({
            virtuals: true,
            transform: (doc) => {
                // Convert ISO string to Date object for proper formatting
                const createdAtDate = new Date(doc.createdAt);

                return {
                    ...doc,
                    formattedSize: formatFileSize(doc.size),
                    date: createdAtDate.toISOString().split('T')[0]
                };
            }
        });
};