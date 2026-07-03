"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { PizzaSizeSchemaInput } from "@/components/admin/PizzaSizeForm"; 

const prisma = new PrismaClient();

export async function createPizzaSizeAction(data: PizzaSizeSchemaInput) {
  try {
    await prisma.pizzaSize.create({
      data: {
        name: data.name,
        price: data.price,
        maxFlavors: data.maxFlavors,
        isActive: data.isActive,
      },
    });

    // Limpa o cache para a lista atualizar na hora
    revalidatePath("/admin/tamanhos");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar tamanho de pizza:", error);
    return { success: false, error: "Falha ao criar o tamanho. Verifique os dados." };
  }
}

export async function updatePizzaSizeAction(id: string, data: PizzaSizeSchemaInput) {
  try {
    await prisma.pizzaSize.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        maxFlavors: data.maxFlavors,
        isActive: data.isActive,
      },
    });

    // Limpa o cache da listagem
    revalidatePath("/admin/tamanhos");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar tamanho de pizza:", error);
    return { success: false, error: "Falha ao atualizar o tamanho. Verifique os dados." };
  }
}

export async function getActivePizzaSizesAction() {
  try {
    const sizes = await prisma.pizzaSize.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    
    // Convertendo Decimal para number para o Client Component não quebrar
    return sizes.map(size => ({
      ...size,
      price: Number(size.price)
    }));
  } catch (error) {
    console.error("Erro ao buscar tamanhos:", error);
    return [];
  }
}