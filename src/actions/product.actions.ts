"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function createProductAction(data: any) {
  try {
    // 🆕 Extraímos também sizePromos
    const { addons, availableSizeIds, availableCrustIds, sizePromos, ...productData } = data;

    const product = await db.product.create({
      data: {
        ...productData,
        availableSizes: availableSizeIds?.length > 0 
          ? { connect: availableSizeIds.map((id: string) => ({ id })) } 
          : undefined,
        availableCrusts: availableCrustIds?.length > 0 
          ? { connect: availableCrustIds.map((id: string) => ({ id })) } 
          : undefined,
        addons: addons?.length > 0 
          ? { create: addons } 
          : undefined,
        // 🆕 cria as promoções por tamanho junto com o produto
        sizePromos: sizePromos?.length > 0
          ? {
              create: sizePromos.map((p: { sizeId: string; promoPrice: number }) => ({
                sizeId: p.sizeId,
                promoPrice: p.promoPrice,
              })),
            }
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
    // 🆕 Extraímos também sizePromos
    const { addons, availableSizeIds, availableCrustIds, sizePromos, ...productData } = data;

    // 🆕 Usamos transaction para garantir que addons + sizePromos + o
    // update do produto acontecem juntos, ou nada acontece (evita ficar
    // com addons apagados mas sizePromos antigos, por exemplo).
    const product = await db.$transaction(async (tx) => {
      // Limpa os adicionais antigos deste produto antes de salvar os novos editados
      await tx.addon.deleteMany({ where: { productId: id } });

      // 🆕 Limpa as promoções por tamanho antigas deste produto
      // (padrão delete-and-recreate: mais simples que fazer diff
      // linha a linha entre o estado antigo e o novo do formulário)
      await tx.pizzaFlavorSizePromo.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          availableSizes: {
            set: availableSizeIds?.map((sizeId: string) => ({ id: sizeId })) || [],
          },
          availableCrusts: {
            set: availableCrustIds?.map((crustId: string) => ({ id: crustId })) || [],
          },
          addons: addons?.length > 0 
            ? { create: addons } 
            : undefined,
          // 🆕 recria as promoções por tamanho com os dados atuais do form
          sizePromos: sizePromos?.length > 0
            ? {
                create: sizePromos.map((p: { sizeId: string; promoPrice: number }) => ({
                  sizeId: p.sizeId,
                  promoPrice: p.promoPrice,
                })),
              }
            : undefined,
        },
      });
    });

    revalidatePath("/admin/produtos");
    return { success: true, data: product };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { success: false, error: "Falha ao atualizar produto" };
  }
}