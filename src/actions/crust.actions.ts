"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCrustAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));

    if (!name || isNaN(price)) {
      return { success: false, error: "Dados inválidos" };
    }

    await db.pizzaCrust.create({
      data: { name, price },
    });

    revalidatePath("/admin/bordas");
    revalidatePath("/admin/produtos/novo");
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao salvar no banco" };
  }
}

export async function updateCrustAction(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));

    if (!name || isNaN(price)) return { success: false };

    await db.pizzaCrust.update({
      where: { id },
      data: { name, price },
    });

    revalidatePath("/admin/bordas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar borda" };
  }
}

export async function deleteCrustAction(id: string) {
  try {
    await db.pizzaCrust.delete({ where: { id } });
    revalidatePath("/admin/bordas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao deletar borda" };
  }
}