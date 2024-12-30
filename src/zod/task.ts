import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.number().optional(),
  categoryId: z.string().optional(),
  position: z.number().optional(),
  dueDate: z.date().optional(),
});
