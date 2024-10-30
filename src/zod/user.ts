import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .refine((value) => /[a-z]/.test(value), {
      message: "Include at least one lowercase letter.",
    })
    .refine((value) => /[A-Z]/.test(value), {
      message: "Include at least one uppercase letter.",
    })
    .refine((value) => /\d/.test(value), {
      message: "Include at least one number.",
    })
    .refine((value) => /[@$!%*?&]/.test(value), {
      message:
        "Include at least one special character (@, $, !, %, *, ?, or &).",
    }),
});

export const verifySchema = z.object({
  email: z.string().min(1, "Email is required.").email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .refine((value) => /[a-z]/.test(value), {
      message: "Include at least one lowercase letter.",
    })
    .refine((value) => /[A-Z]/.test(value), {
      message: "Include at least one uppercase letter.",
    })
    .refine((value) => /\d/.test(value), {
      message: "Include at least one number.",
    })
    .refine((value) => /[@$!%*?&]/.test(value), {
      message:
        "Include at least one special character (@, $, !, %, *, ?, or &).",
    }),
  otp: z.string().min(1, "OTP is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Invalid email format"),
  otp: z.string().min(1, "OTP is required"),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .refine((value) => /[a-z]/.test(value), {
      message: "Include at least one lowercase letter.",
    })
    .refine((value) => /[A-Z]/.test(value), {
      message: "Include at least one uppercase letter.",
    })
    .refine((value) => /\d/.test(value), {
      message: "Include at least one number.",
    })
    .refine((value) => /[@$!%*?&]/.test(value), {
      message:
        "Include at least one special character (@, $, !, %, *, ?, or &).",
    }),
});
