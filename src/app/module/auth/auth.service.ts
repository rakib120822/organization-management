import { UserStatus } from "../../../../generated/prisma/enums";
import { config } from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { createToken } from "../../utils/JwtUtils";
import ejs from "ejs";
import {
  forgetPasswordInput,
  logInUser,
  registerUser as RegisterUser,
  resetPasswordInput,
} from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";
import path from "path";

const registerUser = async (userData: RegisterUser) => {
  const { name, email, password, avatarUrl } = userData;
  if (!name || !email || !password) {
    throw new AppError(httpStatus.NOT_FOUND, "Missing all required filed");
  }
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already Register");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );
  // console.log("hashPassword : ", hashPassword);
  const otp = crypto.randomInt(100000, 1000000);
  await redisClient.set(`registration-otp:${email}`, otp, {
    expiration: {
      type: "EX",
      value: 60 * 5,
    },
  });

  const redisUserData = {
    name,
    email,
    password: hashPassword,
    avatarUrl,
  };
  await redisClient.set(
    `redisUserdata:${email}`,
    JSON.stringify(redisUserData),
    {
      expiration: {
        type: "EX",
        value: 60 * 5,
      },
    },
  );

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/email-verification.ejs",
  );
  const html = await ejs.renderFile(templatePath, {
    otp,
    name,
  });
  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Verification",
    html: html,
  });

  return null;
};

const logInUser = async (payload: logInUser) => {
  const { email, password } = payload;
  if (!email || !password) {
    throw new AppError(httpStatus.BAD_REQUEST, "All fields are required!");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.status === UserStatus.INACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is inactive");
  }
  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is suspended");
  }

  const decoded = await bcrypt.compare(password, user.password);
  if (!decoded) {
    throw new AppError(httpStatus.BAD_REQUEST, "Wrong Password");
  }

  const JwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = await createToken(
    JwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );
  const refreshToken = await createToken(
    JwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );
  const userData = await prisma.user.findUnique({
    where: {
      email,
    },
    omit: {
      password: true,
    },
  });

  return { accessToken, refreshToken, userData };
};

const refreshToken = async (token: string | undefined) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  }

  let decoded: JwtPayload;
  try {
    const verifiedToken = jwt.verify(token, config.jwt_refresh_secret);
    if (typeof verifiedToken === "string" || !verifiedToken.id) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }
    decoded = verifiedToken;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (
    !user ||
    user.isDeleted ||
    !user.isVerified ||
    user.status === UserStatus.INACTIVE ||
    user.status === UserStatus.SUSPENDED
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User is not eligible");
  }

  return createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );
};

const forgetPassword = async (payload: forgetPasswordInput) => {
  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (
    isExistUser.isDeleted ||
    !isExistUser.isVerified ||
    isExistUser.status === UserStatus.INACTIVE ||
    isExistUser.status === UserStatus.SUSPENDED
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not eligible");
  }

  const otp = crypto.randomInt(100000, 1000000);
  await redisClient.set(`forget-password-opt:${payload.email}`, otp, {
    expiration: {
      type: "EX",
      value: 60 * 2,
    },
  });
  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/forgot-password.ejs",
  );
  const html = await ejs.renderFile(templatePath, {
    otp,
    name: isExistUser.name,
  });
  await transporter.sendMail({
    from: config.email_sender,
    to: isExistUser.email,
    subject: "Forget Password OTP",
    html: html,
  });
};

const resetPassword = async (payload: resetPasswordInput) => {
  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (
    isExistUser.isDeleted ||
    !isExistUser.isVerified ||
    isExistUser.status === UserStatus.INACTIVE ||
    isExistUser.status === UserStatus.SUSPENDED
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not eligible");
  }

  const key = `forget-password-opt:${payload.email}`;

  const redisOtp = await redisClient.get(key);
  console.log("redisOtp : ", redisOtp);
  if (!redisOtp) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid otp");
  }
  if (redisOtp != payload.otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP Does not match");
  }

  const hashPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );
  await prisma.user.update({
    where: { email: payload.email },
    data: { password: hashPassword },
  });
  await redisClient.del([key]);
  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/reset-password.ejs",
  );
  const html = await ejs.renderFile(templatePath, {
    name: isExistUser.name,
  });
  await transporter.sendMail({
    from: config.email_sender,
    to: isExistUser.email,
    subject: "Password Change",
    html: html,
  });
};

const verifyEmail = async (payload: { otp: string; email: string }) => {
  const userDataKey = `redisUserdata:${payload.email}`;
  const redisUserData = await redisClient.get(userDataKey);
  const otpKey = `registration-otp:${payload.email}`;
  const redisOtp = await redisClient.get(otpKey);
  if (!redisUserData) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid User");
  }
  if (!redisOtp) {
    throw new AppError(httpStatus.NOT_FOUND, "OTP Expired");
  }
  if (redisOtp != payload.otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }
  const userData = JSON.parse(redisUserData);
  console.log(userData);
  await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      isVerified: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
    omit: {
      password: true,
    },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const JwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = await createToken(
    JwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );
  const refreshToken = await createToken(
    JwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  // console.log({ accessToken, refreshToken });
  await redisClient.del([otpKey,userDataKey]);
  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/welcome-email.ejs",
  );
  const html = await ejs.renderFile(templatePath, {
    name: user.name,
  });
  await transporter.sendMail({
    from: config.email_sender,
    to: user.email,
    subject: "Password Change",
    html: html,
  });

  return { user, accessToken, refreshToken };
};

const authService = {
  registerUser,
  logInUser,
  refreshToken,
  forgetPassword,
  resetPassword,
  verifyEmail,
};

export default authService;
