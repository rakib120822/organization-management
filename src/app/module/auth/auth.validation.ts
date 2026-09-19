import z, { email } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters"),

  email: z
    .email("Please enter a valid email address")
    .trim()
    .min(1, "Email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export const logInUserSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .trim()
    .min(1, "Email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export const forgetPasswordSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .trim()
    .min(1, "Email is required"),
});

export const resetPasswordSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .trim()
    .min(1, "Email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
  otp: z.string("Please provide otp"),
});

export type UserInput = z.infer<typeof userSchema>;
