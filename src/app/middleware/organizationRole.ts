import { NextFunction, Request, Response } from "express";
import { OrganizationMemberRole } from "../../../generated/prisma/enums";

import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const isOrganizationMemberRole = (
	role: unknown,
): role is OrganizationMemberRole => {
	return (
		typeof role === "string" &&
		Object.values(OrganizationMemberRole).includes(
			role as OrganizationMemberRole,
		)
	);
};

export const createAuthOrganizationRole = (
	...requiredRoles: OrganizationMemberRole[]
) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token = req.cookies.accessToken
			? req.cookies.accessToken
			: req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization?.split(" ")[1]
				: req.headers.authorization;

		if (!token) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"Authentication is required to access this resource.",
			);
		}

		const { verifyToken } = require("../utils/JwtUtils");
		const { config } = require("../config");
		const verifiedToken = verifyToken(token, config.jwt_access_secret);

		if (!verifiedToken.success) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"Invalid or expired access token.",
			);
		}

		const payload = verifiedToken.data as {
			id: string;
			email: string;
			role: string;
		};
		const { id, email, role } = payload;

		if (
			typeof id !== "string" ||
			typeof email !== "string" ||
			!isOrganizationMemberRole(role)
		) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token.");
		}

		const user = await prisma.user.findUnique({ where: { id } });

		if (!user || user.email !== email) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token.");
		}

		if (
			user.isDeleted ||
			!user.isVerified ||
			user.status === "INACTIVE" ||
			user.status === "SUSPENDED"
		) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"User account is not eligible.",
			);
		}

		const organizationId =
			typeof req.params.organizationId === "string"
				? req.params.organizationId
				: req.params.organizationId?.[0];

		if (!organizationId) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Organization ID is required.",
			);
		}

		const organizationMember = await prisma.organizationMember.findFirst({
			where: { userId: id, organizationId },
		});

		if (!organizationMember) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You are not a member of this organization.",
			);
		}

		if (
			requiredRoles.length &&
			!requiredRoles.includes(organizationMember.role)
		) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You do not have permission to access this resource.",
			);
		}

		req.user = {
			id: user.id,
			email: user.email,
			role: user.role,
			orgRole: organizationMember.role,
		};

		next();
	});
};
