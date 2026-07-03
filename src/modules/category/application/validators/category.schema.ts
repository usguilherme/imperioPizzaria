import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(60),
  slug: z
    .string()
    .min(2, "Slug deve ter ao menos 2 caracteres")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CategorySchemaInput = z.infer<typeof categorySchema>;