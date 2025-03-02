import express from 'express';
import { UserControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidationSchema } from './user.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/register',
  validateRequest(userValidationSchema),
  UserControllers.createUser,
);

router.get('/me', auth(), UserControllers.getMe);

export const UserRoutes = router;
