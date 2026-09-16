import { Router } from "express";
import authController from "./auth.controller";

const router: Router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.logInUser);

const authRoutes = router;
export default authRoutes;
