import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../User/user.model';
import { TLoginUser } from './auth.interface';

const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const { email, password } = payload;

  // Check if the user exists by email
  const user = await User.isUserExistsByEmail(email);
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User with this Email does not exist',
    );
  }

  // Verify the password
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password does not match');
  }

  const jwtPayload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };

  // Generate token
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '7d',
  });

  return {
    user: jwtPayload,
    token,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // checking if the user is exist
  const user = await User.findUserById(userData.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  //checking if the password is correct
  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

const forgetPassword = async (email: string) => {
  // checking if the user is exist
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email
  };

  const resetToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10m',
  });

  const resetUILink = `${config.reset_pass_ui_link}/reset-password?id=${user._id}&token=${resetToken} `;

  sendEmail(user.email, resetUILink);
  return { resetToken, resetUILink }
};

const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
) => {
  // checking if the user is exist
  const user = await User.findOne({ email: payload?.email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;


  if (payload.email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      email: decoded.email,
    },
    {
      password: newHashedPassword,
    },
  );
};

export const AuthServices = {
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword,
};
