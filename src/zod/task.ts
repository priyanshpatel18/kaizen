import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.number().optional(),
  isCompleted: z.boolean().optional(),
  categoryId: z.string().optional(),
});
