import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import { config } from "./app/config";
import authRoutes from "./app/module/auth/auth.route";
import globalError from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/not-found";
import userRoutes from "./app/module/user/user.route";
import organizationRoutes from "./app/module/orgnization/organization.route";
import invitationRoutes from "./app/module/invitations/invitation.route";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);
app.use(cookieParser());
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/organization", organizationRoutes);
app.use("/api/v1/invitation", invitationRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to Organization management  System Backend",
	});
});

app.use(notFound);
app.use(globalError);

export default app;
