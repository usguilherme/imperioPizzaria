"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- FUNÇÕES EXISTENTES (RECUPERADAS) ---

export async function deleteProductAction(id: string) {
  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/admin/produtos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao deletar" };
  }
}

export async function toggleProductAvailabilityAction(id: string, isAvailable: boolean) {
  try {
    await db.product.update({
      where: { id },
      data: { isAvailable },
    });
    revalidatePath("/admin/produtos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar disponibilidade" };
  }
}

// --- FUNÇÕES DE PRODUTO E ADDONS (NOVAS) ---

export async function createProductAction(data: any) {
  try {
    const { addons, availableSizeIds, ...productData } = data;

    const product = await db.product.create({
      data: {
        ...productData,
        availableSizes: availableSizeIds?.length > 0 
          ? { connect: availableSizeIds.map((id: string) => ({ id })) } 
          : undefined,
        addons: addons?.length > 0 
          ? { create: addons } 
          : undefined,
      },
    });

    revalidatePath("/admin/produtos");
    return { success: true, data: product };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { success: false, error: "Falha ao salvar produto no banco" };
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    const { addons, availableSizeIds, ...productData } = data;

    await db.addon.deleteMany({ where: { productId: id } });

    const product = await db.product.update({
      where: { id },
      data: {
        ...productData,
        availableSizes: {
          set: availableSizeIds.map((id: string) => ({ id })),
        },
        addons: addons?.length > 0 
          ? { create: addons } 
          : undefined,
      },
    });

    revalidatePath("/admin/produtos");
    return { success: true, data: product };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { success: false, error: "Falha ao atualizar produto" };
  }
}