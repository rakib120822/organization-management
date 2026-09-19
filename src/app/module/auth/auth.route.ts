import { Router } from "express";
import authController from "./auth.controller";
import { validationRequest } from "../../middleware/zodValidation";
import {
  emailVerifySchema,
  forgetPasswordSchema,
  logInUserSchema,
  resetPasswordSchema,
  userSchema,
} from "./auth.validation";

const router: Router = Router();

router.post(
  "/register",
  validationRequest(userSchema),
  authController.registerUser,
);
router.post(
  "/login",
  validationRequest(logInUserSchema),
  authController.logInUser,
);
router.post(
  "/forget-password",
  validationRequest(forgetPasswordSchema),
  authController.forgetPassword,
);
router.post(
  "/reset-password",
  validationRequest(resetPasswordSchema),
  authController.resetPassword,
);
router.post(
  "/verify-email",
  validationRequest(emailVerifySchema),
  authController.verifyEmail,
);
const authRoutes = router;
export default authRoutes;
