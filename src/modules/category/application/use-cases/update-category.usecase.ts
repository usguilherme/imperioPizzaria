import { categorySchema, CategorySchemaInput } from "@/modules/category/application/validators/category.schema";
import { categoryRepository } from "@/modules/category/infrastructure/category.repository";

export async function updateCategoryUseCase(id: string, input: CategorySchemaInput) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existing = await categoryRepository.findBySlug(parsed.data.slug);
  if (existing && existing.id !== id) {
    return { success: false, error: "Já existe uma categoria com esse slug" };
  }

  const category = await categoryRepository.update(id, parsed.data);
  return { success: true, data: category };
}