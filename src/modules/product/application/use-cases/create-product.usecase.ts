import { productRepository } from "../../infrastructure/product.repository";
import { productSchema, ProductSchemaInput } from "../validators/product.schema";

interface UseCaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Use case isolado da camada HTTP — pode ser chamado por uma Server Action,
 * uma API route, ou um teste unitário, sem duplicar regra de negócio.
 */
export async function createProductUseCase(
  input: ProductSchemaInput
): Promise<UseCaseResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const product = await productRepository.create({
    ...parsed.data,
    servesInfo: parsed.data.servesInfo ?? null,
    promoPrice: parsed.data.promoPrice ?? null,
  });

  return { success: true, data: { id: product.id } };
}
