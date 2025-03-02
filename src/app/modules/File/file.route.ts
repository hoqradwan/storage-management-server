import express from 'express';
import { upload, uploadFile } from './file.controller';
import auth from '../../middlewares/auth';
// import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/upload', auth(), upload.single('file'), uploadFile);
// router.delete('/:id',  deleteFile);
// Add other routes for rename, copy, etc.

export const FileRoutes = router;