import { Organization } from "../../../../generated/prisma/client";

export interface ICreateInvitation {
	organizationId: string;
	email: string;
	invitedById: string;
}
