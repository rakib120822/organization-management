import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import userService from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const uploadProfileImage = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		console.log(req.file);
		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}
		const email = req.user?.email;

		await userService.uploadProfileImage(req.file.buffer, email!);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "image uploaded successfully",
			data: null,
		});
	},
);

const userController = { uploadProfileImage };

export default userController;
