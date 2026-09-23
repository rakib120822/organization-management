import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validationRequest } from "../../middleware/zodValidation";
import { organizationValidation } from "./organization.validation";
import organizationController from "./organization.controller";

const router: Router = Router();

router.post(
	"/",
	auth(),
	validationRequest(organizationValidation.createOrganizationSchema),
	organizationController.organizationCreate,
);

router.get("/", auth(), organizationController.getOrganization);
router.get("/:id", auth(), organizationController.getOrganizationById);

const organizationRoutes = router;
export default organizationRoutes;
