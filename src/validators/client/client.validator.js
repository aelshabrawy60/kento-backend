// src/validators/auth.validator.js
import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  }),
});

export const onboardSchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 characters long" }).max(15, { message: "Phone number must be at most 15 characters long" }),
    region: z.string().min(2, { message: "Region must be at least 2 characters long" })
  }),
});
