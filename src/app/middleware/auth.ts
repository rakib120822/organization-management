import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { userModel as User } from "../../../generated/prisma/models/user";

import { prisma } from "../lib/prisma";
import {
	UserRole,
	UserStatus,
	OrganizationMemberRole,
} from "../../../generated/prisma/enums";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/app-error";
import { verifyToken } from "../utils/JwtUtils";
import { config } from "../config";

type AuthenticatedUser = {
	id: string;
	email: string;
	role: UserRole;
	orgRole?: OrganizationMemberRole;
};

type FindUserById = (id: string) => Promise<User | null>;

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}

const isUserRole = (role: unknown): role is UserRole => {
	return (
		typeof role === "string" &&
		Object.values(UserRole).includes(role as UserRole)
	);
};

// auth() permits every eligible authenticated user.
// Privileged routes must explicitly list every permitted role, for example:
// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export const createAuth = (
	findUserById: FindUserById = (id) =>
		prisma.user.findUnique({ where: { id } }),
) => {
	return (...requiredRoles: UserRole[]) => {
		return catchAsync(
			async (req: Request, res: Response, next: NextFunction) => {
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

				const verifiedToken = verifyToken(token, config.jwt_access_secret);

				if (!verifiedToken.success) {
					throw new AppError(
						httpStatus.UNAUTHORIZED,
						"Invalid or expired access token.",
					);
				}

				const payload = verifiedToken.data as JwtPayload;
				const { id, email, role } = payload;

				if (
					typeof id !== "string" ||
					typeof email !== "string" ||
					!isUserRole(role)
				) {
					throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token.");
				}

				const user = await findUserById(id);

				if (!user || user.email !== email) {
					throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token.");
				}

				if (
					user.isDeleted ||
					!user.isVerified ||
					user.status === UserStatus.INACTIVE ||
					user.status === UserStatus.SUSPENDED
				) {
					throw new AppError(
						httpStatus.UNAUTHORIZED,
						"User account is not eligible.",
					);
				}

				if (requiredRoles.length && !requiredRoles.includes(user.role)) {
					throw new AppError(
						httpStatus.FORBIDDEN,
						"You do not have permission to access this resource.",
					);
				}

				req.user = {
					id: user.id,
					email: user.email,
					role: user.role,
				};

				next();
			},
		);
	};
};

export const auth = createAuth();
