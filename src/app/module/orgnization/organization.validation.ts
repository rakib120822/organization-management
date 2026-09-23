import { z } from "zod";

/**
 * Create Organization Validation
 */
const createOrganizationSchema = z.object({
	name: z
		.string({
			error: "Organization name is required",
		})
		.trim()
		.min(2, {
			error: "Organization name must be at least 2 characters",
		})
		.max(100, {
			error: "Organization name must not exceed 100 characters",
		}),

	description: z
		.string()
		.trim()
		.max(500, {
			error: "Description must not exceed 500 characters",
		})
		.optional(),
});

/**
 * Update Organization Validation
 */
const updateOrganizationSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, {
				error: "Organization name must be at least 2 characters",
			})
			.max(100, {
				error: "Organization name must not exceed 100 characters",
			})
			.optional(),

		description: z
			.string()
			.trim()
			.max(500, {
				error: "Description must not exceed 500 characters",
			})
			.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		error: "At least one field is required for update",
	});

const organizationParamsSchema = z.object({
	id: z.uuid({ error: "Organization id must be a valid UUID" }),
});

export const organizationValidation = {
	createOrganizationSchema,
	updateOrganizationSchema,
	organizationParamsSchema,
};
