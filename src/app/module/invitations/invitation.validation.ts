import { z } from "zod";

const createInvitationSchema = z.object({
	organizationId: z.uuid("Invalid organization ID"),
	email: z.email("Invalid email address"),
	invitedById: z.uuid("Invalid inviter ID"),
});

export const invitationValidation = {
	createInvitationSchema,
};
