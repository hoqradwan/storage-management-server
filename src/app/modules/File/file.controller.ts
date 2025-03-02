import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { User } from '../User/user.model';
import { File } from './file.model';


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

export const uploadFile = async (req: Request, res: Response) => {
    try {
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

        res.status(201).json(newFile);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
// const MAX_STORAGE = parseInt(process.env.MAX_STORAGE!);

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const userId = req.user.id;
//         const dir = path.join(__dirname, '../../uploads', userId);
//         fs.mkdirSync(dir, { recursive: true }); // Fixed: Use sync version
//         cb(null, dir);
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
//         cb(null, uniqueName);
//     }
// });

// export const upload = multer({
//     storage,
//     limits: { fileSize: MAX_FILE_SIZE } // Fixed: Use separate max file size
// });

// export const uploadFile = async (req: Request, res: Response) => {
//     try {
//         const file = req.file!;
//         const user = await User.findById(req.user.id);

//         if (user!.usedStorage + file.size > MAX_STORAGE) {
//             fs.unlink(file.path);
//             return res.status(400).json({ message: 'Storage limit exceeded' });
//         }

//         const newFile = await File.create({
//             name: file.originalname,
//             type: file.mimetype.startsWith('image/') ? 'image' :
//                 file.mimetype === 'application/pdf' ? 'pdf' : 'note',
//             size: file.size,
//             path: file.path,
//             user: req.user.id
//         });

//         await User.findByIdAndUpdate(req.user.id, { $inc: { usedStorage: file.size } });

//         res.status(201).json(newFile);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// Implement other file operations (rename, copy, delete, etc.) similarly