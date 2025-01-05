import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  workspaceId: z.string().optional(),
  isFavorite: z.boolean().optional(),
});
