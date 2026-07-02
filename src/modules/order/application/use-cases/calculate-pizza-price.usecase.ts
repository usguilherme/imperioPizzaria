import { productRepository } from "@/modules/product/infrastructure/product.repository";

interface PizzaPriceResult {
  success: boolean;
  unitPrice?: number;
  error?: string;
}

/**
 * Regra de negócio clássica de pizzaria: quando o cliente monta pizza de 2 sabores,
 * o preço cobrado é o do sabor de maior valor (não a soma, nem a média).
 * Isolar essa regra em um use-case evita duplicar a lógica no front e no back.
 */
export async function calculatePizzaPriceUseCase(
  flavorOneId: string,
  flavorTwoId?: string | null
): Promise<PizzaPriceResult> {
  const flavorOne = await productRepository.findById(flavorOneId);

  if (!flavorOne || !flavorOne.isFlavorEligible) {
    return { success: false, error: "Sabor 1 inválido ou não elegível" };
  }

  const priceOne = flavorOne.isPromoActive && flavorOne.promoPrice
    ? Number(flavorOne.promoPrice)
    : Number(flavorOne.originalPrice);

  if (!flavorTwoId) {
    return { success: true, unitPrice: priceOne };
  }

  const flavorTwo = await productRepository.findById(flavorTwoId);
  if (!flavorTwo || !flavorTwo.isFlavorEligible) {
    return { success: false, error: "Sabor 2 inválido ou não elegível" };
  }

  const priceTwo = flavorTwo.isPromoActive && flavorTwo.promoPrice
    ? Number(flavorTwo.promoPrice)
    : Number(flavorTwo.originalPrice);

  // Regra: cobra-se sempre o valor do sabor mais caro
  const unitPrice = Math.max(priceOne, priceTwo);

  return { success: true, unitPrice };
}
