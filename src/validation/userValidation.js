import { z } from 'zod';

export const userCreateValidation = z.object({
  name: z.string({ required_error: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['customer', 'admin', 'seller'], { message: 'Role must be customer or admin or seller' }),
});
