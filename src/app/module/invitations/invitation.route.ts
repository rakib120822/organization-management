import { Router } from "express";
import { auth } from "../../middleware/auth";
import { OrganizationMemberRole } from "../../../../generated/prisma/enums";
import invitationController from "./invitation.controller";

const router: Router = Router();

router.post("/", auth(), invitationController.createInvitation);

const invitationRoutes = router;

export default invitationRoutes;
