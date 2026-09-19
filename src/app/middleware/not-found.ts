import type { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export default notFound;