import { UserRole } from "../../../generated/prisma/enums";
import { config } from "../config";
import jwt, { SignOptions } from "jsonwebtoken";

export const createToken = async (
  JwtPayload: {
    id: string;
    email: string;
    role: UserRole;
  },
  secret: string,
  expiresIn: string,
) => {
  try {
    const token = jwt.sign(JwtPayload, secret, {
      expiresIn: expiresIn as SignOptions["expiresIn"],
    });

    return token;
  } catch (error) {
    console.log("from jwt utils function : ", error);
  }
};

export const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
