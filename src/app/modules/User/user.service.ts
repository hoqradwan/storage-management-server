/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Types } from 'mongoose';
import { TUser } from './user.interface';
import { User } from './user.model';
import { File } from '../File/file.model';
import fs from 'fs/promises';
import path from 'path';

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
export const deleteUserAccount = async (userId: string) => {
  try {
    // 1. Delete all user files and their database records
    const files = await File.find({ user: userId });

    // Delete physical files
    await Promise.all(files.map(async (file) => {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error(`Failed to delete file: ${file.path}`, err);
      }
    }));

    // Delete file records
    await File.deleteMany({ user: userId });

    // 2. Delete user's upload directory
    const userDir = path.join(__dirname, '../../uploads', userId);
    try {
      await fs.rm(userDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`Failed to delete user directory: ${userDir}`, err);
    }

    // 3. Delete user account
    await User.findByIdAndDelete(userId);

  } catch (error) {
    console.error('Account deletion failed:', error);
    throw new Error('Account deletion failed');
  }
};
export const UserServices = {
  createUserIntoDB,
  getMe,
};
