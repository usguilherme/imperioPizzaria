import { prisma } from "@/lib/prisma";

interface CalculatePizzaPriceResult {
  success: boolean;
  unitPrice?: number;
  error?: string;
}

export async function calculatePizzaPriceUseCase(
  sizeId: string,
  flavorOneId: string,
  flavorTwoId?: string | null
): Promise<CalculatePizzaPriceResult> {
  try {
    // 1. Busca o preço base do tamanho da pizza
    const size = await prisma.pizzaSize.findUnique({
      where: { id: sizeId },
    });

    if (!size) {
      return { success: false, error: "Tamanho de pizza não encontrado." };
    }

    // 2. Busca Sabor 1 e valida tamanhos permitidos
    const flavorOne = await prisma.product.findUnique({
      where: { id: flavorOneId },
      include: { availableSizes: true }
    });

    if (!flavorOne || !flavorOne.isAvailable) {
      return { success: false, error: "Primeiro sabor indisponível." };
    }

    if (flavorOne.availableSizes.length > 0) {
      const isAllowed = flavorOne.availableSizes.some(s => s.id === sizeId);
      if (!isAllowed) {
        return { success: false, error: `O sabor '${flavorOne.title}' não está disponível neste tamanho.` };
      }
    }

    // 3. Busca Sabor 2 e valida (se houver 2 sabores)
    if (flavorTwoId) {
      const flavorTwo = await prisma.product.findUnique({
        where: { id: flavorTwoId },
        include: { availableSizes: true }
      });

      if (!flavorTwo || !flavorTwo.isAvailable) {
        return { success: false, error: "Segundo sabor indisponível." };
      }

      if (flavorTwo.availableSizes.length > 0) {
        const isAllowed = flavorTwo.availableSizes.some(s => s.id === sizeId);
        if (!isAllowed) {
          return { success: false, error: `O sabor '${flavorTwo.title}' não está disponível neste tamanho.` };
        }
      }
    }

    // 4. Se tudo estiver ok, o preço da pizza é o preço do tamanho escolhido
    return { success: true, unitPrice: Number(size.price) };

  } catch (error) {
    console.error("Erro calcular pizza:", error);
    return { success: false, error: "Erro interno ao validar pizza." };
  }
}