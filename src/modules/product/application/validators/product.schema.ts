import { z } from "zod";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// 🆕 Uma linha de promoção de sabor para um tamanho específico
const sizePromoSchema = z.object({
  sizeId: z.string().cuid("Tamanho inválido"),
  promoPrice: z.coerce.number().positive("Preço promocional deve ser maior que zero"),
});

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
    // 🆕 promoções de sabor por tamanho (só relevante quando isFlavorEligible + isPromoActive)
    sizePromos: z.array(sizePromoSchema).default([]),
  })
  .refine(
    (data) => !data.isPromoActive || (data.promoPrice != null && data.promoPrice < data.originalPrice),
    {
      message: "Preço promocional deve ser menor que o preço original quando a promoção está ativa",
      path: ["promoPrice"],
    }
  )
  // 🆕 impede duas promoções configuradas para o mesmo tamanho
  .refine(
    (data) => {
      const sizeIds = data.sizePromos.map((p) => p.sizeId);
      return new Set(sizeIds).size === sizeIds.length;
    },
    {
      message: "Existem duas promoções configuradas para o mesmo tamanho",
      path: ["sizePromos"],
    }
  )
  // 🆕 promoção por tamanho só faz sentido se o sabor for elegível para pizza
  .refine(
    (data) => data.sizePromos.length === 0 || data.isFlavorEligible,
    {
      message: "Só é possível configurar promoção por tamanho para produtos elegíveis como sabor de pizza",
      path: ["sizePromos"],
    }
  );

export type ProductSchemaInput = z.infer<typeof productSchema>;

// Validação do arquivo enviado pelo <input type="file">
export const productImageFileSchema = z
  .instanceof(File, { message: "Selecione uma imagem" })
  .refine((file) => file.size > 0, "Selecione uma imagem")
  .refine((file) => file.size <= MAX_FILE_SIZE, "Imagem deve ter no máximo 4MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Formato inválido. Use JPG, PNG ou WEBP"
  );