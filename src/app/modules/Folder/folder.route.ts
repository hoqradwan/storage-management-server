import express from 'express';
import auth from '../../middlewares/auth';
import { createFolder, addFilesToFolder, getFolderFiles, deleteFolder, getAllFolders } from './folder.controller';
import validateRequest from '../../middlewares/validateRequest';
import { FolderValidations, } from './folder.validation';
const router = express.Router();


router.get('/', auth(), getAllFolders);
router.get('/:id/files', auth(), getFolderFiles);
router.post('/', auth(), validateRequest(FolderValidations.createFolderSchema), createFolder);
router.post('/:id/files', auth(), validateRequest(FolderValidations.addFilesValidationSchema), addFilesToFolder);
router.post('/:id', auth(), deleteFolder);


export const FolderRoutes = router;