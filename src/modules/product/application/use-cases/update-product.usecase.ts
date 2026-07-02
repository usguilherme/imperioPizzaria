import { productRepository } from "../../infrastructure/product.repository";
import { productSchema, ProductSchemaInput } from "../validators/product.schema";

interface UseCaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function updateProductUseCase(
  id: string,
  input: ProductSchemaInput
): Promise<UseCaseResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const existing = await productRepository.findById(id);
  if (!existing) {
    return { success: false, error: "Produto não encontrado" };
  }

  const product = await productRepository.update(id, parsed.data);
  return { success: true, data: { id: product.id } };
}
