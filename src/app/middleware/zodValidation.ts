import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import z from "zod";

export const validationRequest = (zodSchema: z.ZodObject) => {
  return catchAsync((req: Request, res: Response, next: NextFunction) => {
    const payload = req.body ?? {};
    const result = zodSchema.safeParse(payload);
    if (!result.success) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        result.error.issues[0].message,
      );
    }
    req.body = result.data;
    next();
  });
};
