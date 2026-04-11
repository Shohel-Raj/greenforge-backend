
import { email, z } from 'zod';

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const createUser = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: strongPassword,
});

export const loginUser = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const Authvalidate ={
    createUser,
    loginUser
}