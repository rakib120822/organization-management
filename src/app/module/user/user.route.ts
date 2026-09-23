import { Router } from "express";
import { validationRequest } from "../../middleware/zodValidation";
import userController from "./user.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/auth";

const router: Router = Router();

router.patch(
	"/upload-profile",
	auth(),
	upload.single("image"),
	userController.uploadProfileImage,
);

const userRoutes = router;
export default userRoutes;
