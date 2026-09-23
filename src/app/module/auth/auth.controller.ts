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
import { config } from "../../config";

const registerUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await authService.registerUser(req.body);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Please Check your email for otp",
			data: result,
		});
	},
);

const logInUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await authService.logInUser(req.body);
		// console.log(result);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Login Successful",
			data: result,
		});
	},
);

const refreshToken = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const token = req.cookies.refreshToken ?? req.body?.refreshToken;
		const accessToken = await authService.refreshToken(token);

		res.cookie("accessToken", accessToken, {
			maxAge: 900000,
			httpOnly: true,
			secure: config.node_env === "production",
			sameSite: "lax",
		});

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Access token refreshed successfully",
			data: { accessToken },
		});
	},
);

const forgetPassword = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		await authService.forgetPassword(req.body);
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
		await authService.resetPassword(req.body);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Password change successful",
			data: null,
		});
	},
);

const verifyEmail = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await authService.verifyEmail(req.body);
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
			message: "User created successful",
			data: result,
		});
	},
);

const authController = {
	registerUser,
	logInUser,
	refreshToken,
	forgetPassword,
	resetPassword,
	verifyEmail,
};

export default authController;
