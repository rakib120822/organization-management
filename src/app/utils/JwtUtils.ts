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

