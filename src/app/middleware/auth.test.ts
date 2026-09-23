import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { UserRole as UserRoleType } from "../../../generated/prisma/enums";
import type { userModel as User } from "../../../generated/prisma/models/user";

const testAccessSecret = "test-access-secret";
process.env.JWT_ACCESS_SECRET = testAccessSecret;

const { createAuth } = await import("./auth");
const { AppError } = await import("../utils/app-error");
const { UserRole, UserStatus } = await import(
	"../../../generated/prisma/enums"
);

const userId = "a197e2a6-17a1-4290-a5a2-00a6f4a9f239";
const email = "user@example.com";

const createUser = (overrides: Partial<User> = {}): User => ({
	id: userId,
	name: "Test User",
	email,
	password: "hashed-password",
	avatarUrl: null,
	avatarPublicId: null,
	isVerified: true,
	isDeleted: false,
	status: UserStatus.ACTIVE,
	createdAt: new Date(),
	updatedAt: new Date(),
	role: UserRole.USER,
	...overrides,
});

let databaseUser: User = createUser();

const createAccessToken = (
	role: UserRoleType = UserRole.USER,
	expiresIn: SignOptions["expiresIn"] = "15m",
) => {
	return jwt.sign({ id: userId, email, role }, testAccessSecret, {
		expiresIn,
	});
};

const runMiddleware = async (
	token: string | undefined,
	roles: UserRoleType[] = [],
) => {
	const req = {
		cookies: {},
		headers: token ? { authorization: `Bearer ${token}` } : {},
	} as Request;

	const error = await new Promise<unknown>((resolve) => {
		createAuth(async () => databaseUser)(...roles)(
			req,
			{} as Response,
			(nextError?: unknown) => {
				resolve(nextError ?? null);
			},
		);
	});

	return { error, req };
};

const expectAppError = (error: unknown, statusCode: number) => {
	assert.ok(error instanceof AppError);
	assert.equal(error.statusCode, statusCode);
};

test("rejects requests without an access token", async () => {
	const { error } = await runMiddleware(undefined);

	expectAppError(error, httpStatus.UNAUTHORIZED);
});

test("rejects malformed and expired access tokens", async () => {
	const malformed = await runMiddleware("not-a-jwt");
	expectAppError(malformed.error, httpStatus.UNAUTHORIZED);

	const expired = await runMiddleware(createAccessToken(UserRole.USER, -1));
	expectAppError(expired.error, httpStatus.UNAUTHORIZED);
});

test("rejects deleted, unverified, inactive, and suspended accounts", async () => {
	const token = createAccessToken();
	const ineligibleAccounts = [
		createUser({ isDeleted: true }),
		createUser({ isVerified: false }),
		createUser({ status: UserStatus.INACTIVE }),
		createUser({ status: UserStatus.SUSPENDED }),
	];

	for (const account of ineligibleAccounts) {
		databaseUser = account;
		const { error } = await runMiddleware(token);
		expectAppError(error, httpStatus.UNAUTHORIZED);
	}
});

test("permits eligible users for auth() and sets the database role", async () => {
	const eligibleRoles = [
		UserRole.USER,
		UserRole.CUSTOMER,
		UserRole.ADMIN,
		UserRole.SUPER_ADMIN,
	];

	for (const role of eligibleRoles) {
		databaseUser = createUser({ role });
		const { error, req } = await runMiddleware(createAccessToken(role));

		assert.equal(error, null);
		assert.deepEqual(req.user, { id: userId, email, role });
	}
});

test("permits only explicitly listed roles", async () => {
	databaseUser = createUser({ role: UserRole.ADMIN });
	const allowed = await runMiddleware(createAccessToken(UserRole.ADMIN), [
		UserRole.ADMIN,
	]);
	assert.equal(allowed.error, null);

	databaseUser = createUser({ role: UserRole.SUPER_ADMIN });
	const denied = await runMiddleware(createAccessToken(UserRole.SUPER_ADMIN), [
		UserRole.ADMIN,
	]);
	expectAppError(denied.error, httpStatus.FORBIDDEN);
});

test("uses the current database role when a role changes", async () => {
	const token = createAccessToken(UserRole.USER);
	databaseUser = createUser({ role: UserRole.USER });

	const beforeRoleChange = await runMiddleware(token, [UserRole.USER]);
	assert.equal(beforeRoleChange.error, null);

	databaseUser = createUser({ role: UserRole.CUSTOMER });
	const afterRoleChange = await runMiddleware(token, [UserRole.USER]);
	expectAppError(afterRoleChange.error, httpStatus.FORBIDDEN);
});
