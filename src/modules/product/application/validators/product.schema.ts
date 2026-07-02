import { z } from "zod";

export const productSchema = z
  .object({
    title: z.string().min(3, "Título deve ter ao menos 3 caracteres").max(120),
    description: z.string().min(10, "Descrição muito curta").max(500),
    imageUrl: z.string().url("URL de imagem inválida"),
    type: z.enum(["SIMPLE", "PIZZA"]),
    servesInfo: z.string().max(60).nullable().optional(),
    originalPrice: z.coerce.number().positive("Preço original deve ser maior que zero"),
    promoPrice: z.coerce.number().positive().nullable().optional(),
    isPromoActive: z.boolean().default(false),
    isFlavorEligible: z.boolean().default(false),
    categoryId: z.string().cuid("Categoria inválida"),
  })
  .refine(
    (data) => !data.isPromoActive || (data.promoPrice != null && data.promoPrice < data.originalPrice),
    {
      message: "Preço promocional deve ser menor que o preço original quando a promoção está ativa",
      path: ["promoPrice"],
    }
  );

export type ProductSchemaInput = z.infer<typeof productSchema>;
