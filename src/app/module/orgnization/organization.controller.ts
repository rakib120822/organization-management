import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import organizationService from "./organization.service";
import { AppError } from "../../utils/app-error";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { organizationValidation } from "./organization.validation";

const organizationCreate = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.id;
		const payload = req.body;
		if (!userId) {
			throw new AppError(httpStatus.BAD_REQUEST, "Please Log in");
		}
		const result = await organizationService.createOrganization(
			payload,
			userId,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Organization created successfull",
			data: result,
		});
	},
);
const getOrganization = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.id;
		if (!userId) {
			throw new AppError(httpStatus.BAD_REQUEST, "Please Log in");
		}
		const result = await organizationService.getOrganization(userId);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Organization retrieve successful",
			data: result,
		});
	},
);
const getOrganizationById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.id;
		const params = organizationValidation.organizationParamsSchema.safeParse(
			req.params,
		);
		if (!params.success) {
			throw new AppError(httpStatus.BAD_REQUEST, "Invalid organization id");
		}
		if (!userId) {
			throw new AppError(httpStatus.BAD_REQUEST, "Please Log in");
		}
		const result = await organizationService.getOrganizationById(
			params.data.id,
			userId,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Organization retrieve successful",
			data: result,
		});
	},
);

const organizationController = {
	organizationCreate,
	getOrganization,
	getOrganizationById,
};

export default organizationController;
