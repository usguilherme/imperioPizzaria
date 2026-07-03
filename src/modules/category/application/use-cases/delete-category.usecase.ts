import { categoryRepository } from "@/modules/category/infrastructure/category.repository";

export async function deleteCategoryUseCase(id: string) {
  const productCount = await categoryRepository.countProducts(id);

  if (productCount > 0) {
    return {
      success: false,
      error: `Não é possível excluir: existem ${productCount} produto(s) nessa categoria`,
    };
  }

  await categoryRepository.delete(id);
  return { success: true };
}