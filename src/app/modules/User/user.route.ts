import express from 'express';
import { deleteUser, getMe, createUser } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidationSchema } from './user.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/register',
  validateRequest(userValidationSchema),
  createUser,
);

router.get('/me', auth(), getMe);
router.post('/delete', auth(), deleteUser);

export const UserRoutes = router;
