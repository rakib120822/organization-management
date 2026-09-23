import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import httpStatus from "http-status";
import {
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
} from "../../../generated/prisma/internal/prismaNamespace";
import { ZodError } from "zod";

import { config } from "../config";
import { AppError } from "../utils/app-error";

const globalError: ErrorRequestHandler = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
	let message = "Something went wrong";
	let stack: string | null = null;

	/*
	 * ============================================
	 * ZOD ERROR
	 * ============================================
	 */
	if (err instanceof ZodError) {
		statusCode = httpStatus.BAD_REQUEST;

		message = "Validation failed";

		const errors = err.issues.map((issue) => ({
			field: issue.path.join("."),
			message: issue.message,
		}));

		return res.status(statusCode).json({
			success: false,
			statusCode,
			message,
			errors,
			...(config.node_env !== "production" && {
				stack: err.stack,
			}),
		});
	}

	/*
	 * ============================================
	 * CUSTOM APP ERROR
	 * ============================================
	 */
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		stack = err.stack ?? null;

		return res.status(statusCode).json({
			success: false,
			statusCode,
			message,
			...(config.node_env !== "production" && {
				stack,
			}),
		});
	}

	/*
	 * ============================================
	 * PRISMA VALIDATION ERROR
	 * ============================================
	 */
	if (err instanceof PrismaClientValidationError) {
		statusCode = httpStatus.BAD_REQUEST;
		message = "Invalid data provided to the database";
	} else if (err instanceof PrismaClientKnownRequestError) {
		/*
		 * ============================================
		 * PRISMA KNOWN REQUEST ERROR
		 * ============================================
		 */
		switch (err.code) {
			/*
			 * Unique constraint failed
			 */
			case "P2002":
				statusCode = httpStatus.CONFLICT;
				message = "A record with the provided value already exists";
				break;

			/*
			 * Foreign key constraint failed
			 */
			case "P2003":
				statusCode = httpStatus.BAD_REQUEST;
				message = "Related record does not exist";
				break;

			/*
			 * Record not found
			 */
			case "P2025":
				statusCode = httpStatus.NOT_FOUND;
				message = "The requested record was not found";
				break;

			/*
			 * Generic Prisma known error
			 */
			default:
				statusCode = httpStatus.INTERNAL_SERVER_ERROR;
				message = "A database error occurred";
				break;
		}
	} else if (err instanceof PrismaClientInitializationError) {
		/*
		 * ============================================
		 * PRISMA INITIALIZATION ERROR
		 * ============================================
		 */
		switch (err.errorCode) {
			/*
			 * Database authentication failed
			 */
			case "P1000":
				statusCode = httpStatus.INTERNAL_SERVER_ERROR;
				message = "Database authentication failed";
				break;

			/*
			 * Database server unreachable
			 */
			case "P1001":
				statusCode = httpStatus.SERVICE_UNAVAILABLE;
				message = "Database server is currently unavailable";
				break;

			/*
			 * Other Prisma initialization errors
			 */
			default:
				statusCode = httpStatus.INTERNAL_SERVER_ERROR;
				message = "Database initialization failed";
				break;
		}
	} else if (err instanceof PrismaClientUnknownRequestError) {
		/*
		 * ============================================
		 * PRISMA UNKNOWN REQUEST ERROR
		 * ============================================
		 */
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = "An unexpected database error occurred";
	} else if (err instanceof Error) {
		/*
		 * ============================================
		 * STANDARD JAVASCRIPT ERROR
		 * ============================================
		 */
		message = err.message || "Something went wrong";
		stack = err.stack ?? null;
	} else {
		/*
		 * ============================================
		 * UNKNOWN ERROR
		 * ============================================
		 */
		message = "An unexpected error occurred";
	}

	/*
	 * ============================================
	 * LOG ERROR
	 * ============================================
	 *
	 * In production, you should eventually replace
	 * console.error with Winston/Pino/etc.
	 */
	if (statusCode >= 500) {
		console.error("GLOBAL ERROR:", {
			method: req.method,
			url: req.originalUrl,
			statusCode,
			error: err,
		});
	}

	/*
	 * ============================================
	 * RESPONSE
	 * ============================================
	 */

	console.log("stack ", stack);

	const response: {
		success: boolean;
		statusCode: number;
		message: string;
		stack?: string;
	} = {
		success: false,
		statusCode,
		message,
	};

	/*
	 * Never expose stack traces in production.
	 */
	if (config.node_env !== "production" && stack) {
		response.stack = stack;
	}

	return res.status(statusCode).json(response);
};

export default globalError;
