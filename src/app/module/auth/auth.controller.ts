import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import {
  forgetPasswordSchema,
  logInUserSchema,
  resetPasswordSchema,
  userSchema,
} from "./auth.validation";
import authService from "./auth.service";
import { AppError } from "../../utils/app-error";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = userSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(httpStatus.BAD_REQUEST, "All fields are required");
    }

    const result = await authService.registerUser(body.data);
    res.cookie("accessToken", result.accessToken, {
      maxAge: 900000, // Expires after 15 minutes (in milliseconds)
      httpOnly: true, // Prevents client-side JavaScript access (highly recommended)
      secure: true, // Ensures cookie is only sent over HTTPS
      sameSite: "lax", // Protects against CSRF attacks
    });
    res.cookie("refreshToken", result.refreshToken, {
      maxAge: 900000, // Expires after 15 minutes (in milliseconds)
      httpOnly: true, // Prevents client-side JavaScript access (highly recommended)
      secure: true, // Ensures cookie is only sent over HTTPS
      sameSite: "lax", // Protects against CSRF attacks
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully",
      data: result,
    });
  },
);

const logInUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = logInUserSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(httpStatus.BAD_REQUEST, "Something is wrong");
    }

    const result = await authService.logInUser(body.data);
    // console.log(result);
    res.cookie("accessToken", result.accessToken, {
      maxAge: 900000, // Expires after 15 minutes (in milliseconds)
      httpOnly: true, // Prevents client-side JavaScript access (highly recommended)
      secure: true, // Ensures cookie is only sent over HTTPS
      sameSite: "lax", // Protects against CSRF attacks
    });

    res.cookie("refreshToken", result.refreshToken, {
      maxAge: 900000, // Expires after 15 minutes (in milliseconds)
      httpOnly: true, // Prevents client-side JavaScript access (highly recommended)
      secure: true, // Ensures cookie is only sent over HTTPS
      sameSite: "lax", // Protects against CSRF attacks
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Login Successful",
      data: result,
    });
  },
);

const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = forgetPasswordSchema.safeParse(req.body);
    if (!payload.success) {
      throw new AppError(httpStatus.BAD_REQUEST, "Something is wrong");
    }
    await authService.forgetPassword(payload.data);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "otp send in your email",
      data: null,
    });
  },
);
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = resetPasswordSchema.safeParse(req.body);
    if (!payload.success) {
      throw new AppError(httpStatus.BAD_REQUEST, "Something is wrong");
    }
    await authService.resetPassword(payload.data);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password change successful",
      data: null,
    });
  },
);

const authController = {
  registerUser,
  logInUser,
  forgetPassword,
  resetPassword,
};

export default authController;
