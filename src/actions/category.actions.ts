"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/auth.config";
import { createCategoryUseCase } from "@/modules/category/application/use-cases/create-category.usecase";
import { updateCategoryUseCase } from "@/modules/category/application/use-cases/update-category.usecase";
import { deleteCategoryUseCase } from "@/modules/category/application/use-cases/delete-category.usecase";
import { categoryRepository } from "@/modules/category/infrastructure/category.repository";
import { CategorySchemaInput } from "@/modules/category/application/validators/category.schema";

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }
}

export async function createCategoryAction(input: CategorySchemaInput) {
  await assertAdmin();
  const result = await createCategoryUseCase(input);
  if (result.success) revalidatePath("/admin/categorias");
  return result;
}

export async function updateCategoryAction(id: string, input: CategorySchemaInput) {
  await assertAdmin();
  const result = await updateCategoryUseCase(id, input);
  if (result.success) {
    revalidatePath("/admin/categorias");
    revalidatePath("/");
  }
  return result;
}

export async function deleteCategoryAction(id: string) {
  await assertAdmin();
  const result = await deleteCategoryUseCase(id);
  if (result.success) revalidatePath("/admin/categorias");
  return result;
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean) {
  await assertAdmin();
  await categoryRepository.toggleActive(id, isActive);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}