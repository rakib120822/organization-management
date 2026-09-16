import { UserStatus } from "../../../../generated/prisma/enums";
import { config } from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { createToken } from "../../utils/JwtUtils";
import { logInUser, registerUser as RegisterUser } from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status";

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
  console.log("hashPassword : ", hashPassword);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      avatarUrl,
    },
  });

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

  console.log({ accessToken, refreshToken });

  return { user, accessToken, refreshToken };
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

const authService = {
  registerUser,
  logInUser,
};

export default authService;
