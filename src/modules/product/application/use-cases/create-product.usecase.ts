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

  // Cast para 'any' para permitir campos extras que o Zod ainda não valida
  const data = parsed.data as any;

  const product = await productRepository.create({
    ...data,
    servesInfo: data.servesInfo ?? null,
    promoPrice: data.promoPrice ?? null,
    isAvailable: data.isAvailable ?? true, // Define como disponível por padrão
    availableSizeIds: data.availableSizeIds ?? [], // Passa os tamanhos selecionados
  });

  return { success: true, data: { id: product.id } };
}