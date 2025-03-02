/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Types } from 'mongoose';
import { TUser } from './user.interface';
import { User } from './user.model';

const createUserIntoDB = async (userData: TUser) => {
  const newUser = await User.create(userData);
  return newUser;
};

const getMe = async (userId: string) => {
  const result = await User.findOne({
    _id: new Types.ObjectId(userId),
  });

  return result;
};

export const UserServices = {
  createUserIntoDB,
  getMe,
};
