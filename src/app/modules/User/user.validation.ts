import { z } from 'zod';

export const userValidationSchema = z.object({
  body: z.object({
    name: z
    .string()
    .min(3, "Name must be at least 3 characters long.")
    .max(50, "Name must be at most 50 characters long."),
  email: z
    .string()
    .email("Invalid email format."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/\d/, "Password must include at least one number.")
    .regex(/[@$!%*?&]/, "Password must include at least one special character."),
  })
 
});


export const UserValidation = {
  userValidationSchema,
};
