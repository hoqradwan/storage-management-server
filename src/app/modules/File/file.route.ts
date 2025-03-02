import express from 'express';
import { deleteFile, duplicateFile, toggleFavorite, getAllFiles, renameFile, uploadFile, getStorageSummary, getRecentFiles } from './file.controller';
import auth from '../../middlewares/auth';
import { upload } from './file.service';

const router = express.Router();

router.get('/', auth(), getAllFiles);
router.get('/summary', auth(), getStorageSummary);
router.get('/recent', auth(), getRecentFiles);
router.post('/upload', auth(), upload.single('file'), uploadFile);
router.post('/:id', auth(), deleteFile);
router.post('/:id/rename', auth(), renameFile);
router.post('/:id/duplicate', auth(), duplicateFile);
router.post('/:id/favorite', auth(), toggleFavorite);

export const FileRoutes = router;