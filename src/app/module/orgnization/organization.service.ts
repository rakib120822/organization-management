import { OrganizationMemberRole } from "../../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { ICreateOrganization } from "./organization.interface";
import httpStatus from "http-status";
const createOrganization = async (
	payload: ICreateOrganization,
	userId: string,
) => {
	const organizationCreated = await prisma.organization.create({
		data: {
			name: payload.name,
			description: payload.description,
			ownerId: userId,
		},
	});

	const organizationMember = await prisma.organizationMember.create({
		data: {
			userId,
			organizationId: organizationCreated.id,
			role: OrganizationMemberRole.OWNER,
		},
	});

	const organization = await prisma.organization.findUnique({
		where: { id: organizationCreated.id },
		include: {
			owner: {
				select: {
					email: true,
					id: true,
					name: true,
				},
			},
			omit: {
				password: true,
			},
		},
	});

	return organization;
};

const getOrganization = async (ownerId: string) => {
	const organizations = await prisma.organization.findMany({
		where: { ownerId: ownerId },
	});
	if (!organizations.length) {
		return {
			message: "No organization available",
			data: organizations,
		};
	}
	return {
		message: "Retrieve all organization",
		data: organizations,
	};
};

const getOrganizationById = async (organizationId: string, ownerId: string) => {
	const organization = await prisma.organization.findUnique({
		where: {
			id: organizationId,
			ownerId,
		},
	});
	if (!organization) {
		throw new AppError(httpStatus.NOT_FOUND, "Organization is not available");
	}
	return organization;
};

const organizationService = {
	createOrganization,
	getOrganization,
	getOrganizationById,
};

export default organizationService;
