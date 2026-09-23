import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { ICreateInvitation } from "./invitation.interface";
import httpStatus from "http-status";
import crypto from "crypto";
import ejs from "ejs";
import { config } from "../../config";
import { transporter } from "../../lib/nodemailer";
import path from "path";

const createInvitation = async (payload: ICreateInvitation, userId: string) => {
	const existingMember = await prisma.organizationMember.findFirst({
		where: {
			organizationId: payload.organizationId,
			user: { email: payload.email },
		},
		include: {
			organization: true,
		},
	});
	if (existingMember) {
		throw new AppError(httpStatus.CONFLICT, "User is already a member");
	}
	const pending = await prisma.invitation.findFirst({
		where: {
			organizationId: payload.organizationId,
			email: payload.email,
			acceptedAt: null,
			expiresAt: { gt: new Date() },
		},
	});
	if (pending) {
		throw new AppError(httpStatus.CONFLICT, "Invitation already pending");
	}
	const organization = await prisma.organization.findUnique({
		where: { id: payload.organizationId },
	});
	if (!organization) {
		throw new AppError(httpStatus.NOT_FOUND, "Organization is not found!");
	}
	const rawToken = crypto.randomBytes(32).toString("hex");
	const tokenHash = crypto
		.createHash(organization?.name)
		.update(rawToken)
		.digest("hex");
	console.log("token hash : ", tokenHash);

	const expiresAt = new Date(
		Date.now() + Number(config.invite_ttl_days) * 24 * 60 * 60 * 1000,
	);
	const invitation = await prisma.invitation.create({
		data: {
			organizationId: payload.organizationId,
			email: payload.email,
			tokenHash,
			expiresAt,
			invitedById: userId,
		},
	});
	const inviteUrl = `${config.frontend_url}/invitations/accept?token=${rawToken}`;
	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/invitation.ejs",
	);
	const html = await ejs.renderFile(templatePath, {
		inviteUrl,
	});

	await transporter.sendMail({
		from: config.email_sender,
		to: payload.email,
		subject: "Invitation link to join the organization",
		html: html,
	});

	return invitation;
};

const invitationService = {
	createInvitation,
};

export default invitationService;
