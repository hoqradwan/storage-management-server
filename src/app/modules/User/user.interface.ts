/* eslint-disable no-unused-vars */
import { Model, Document } from 'mongoose';

export interface TUser extends Document {
  name: string;
  email: string;
  password: string;
  usedStorage: number;
}

export interface UserModel extends Model<TUser> {
  isUserExistsById(userId: string): unknown;
  isUserExistsByEmail(email: string): Promise<TUser | null>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  findUserById(userId: string): Promise<TUser | null>;
}
