import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AppError } from "../../utils/app-error";
import httpStatus from "http-status";
import invitationService from "./invitation.service";
import { sendResponse } from "../../utils/sendResponse";

const createInvitation = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.id;
		if (!userId) {
			throw new AppError(httpStatus.CONFLICT, "Please login");
		}
		const payload = req.body;
		const result = await invitationService.createInvitation(payload, userId);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Send invitation link",
			data: result,
		});
	},
);

const invitationController = {
	createInvitation,
};

export default invitationController;
