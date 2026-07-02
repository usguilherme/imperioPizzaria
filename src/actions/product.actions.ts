"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/auth.config";
import { createProductUseCase } from "@/modules/product/application/use-cases/create-product.usecase";
import { updateProductUseCase } from "@/modules/product/application/use-cases/update-product.usecase";
import { productRepository } from "@/modules/product/infrastructure/product.repository";
import { ProductSchemaInput } from "@/modules/product/application/validators/product.schema";

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }
}

export async function createProductAction(input: ProductSchemaInput) {
  await assertAdmin();
  const result = await createProductUseCase(input);
  if (result.success) revalidatePath("/admin/produtos");
  return result;
}

export async function updateProductAction(id: string, input: ProductSchemaInput) {
  await assertAdmin();
  const result = await updateProductUseCase(id, input);
  if (result.success) {
    revalidatePath("/admin/produtos");
    revalidatePath("/");
  }
  return result;
}

export async function deleteProductAction(id: string) {
  await assertAdmin();
  await productRepository.delete(id);
  revalidatePath("/admin/produtos");
}

export async function toggleProductAvailabilityAction(id: string, isAvailable: boolean) {
  await assertAdmin();
  await productRepository.toggleAvailability(id, isAvailable);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
