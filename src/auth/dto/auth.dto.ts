import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string('User name is required').nonempty().trim(),
    email: z.email().nonempty().trim(),
    password: z
      .string()
      .min(6, 'Please create longer than 6 characters password')
      .nonempty(),
    role: z.enum(['user', 'admin']).default('user'),
  })
  .required();

export type SignupDto = z.infer<typeof signupSchema>;

export const loginSchema = z
  .object({
    email: z.email('Email address is required').nonempty().trim(),
    password: z.string('Password is required').nonempty(),
  })
  .required();

export type LoginDto = z.infer<typeof loginSchema>;
