import { prisma } from "@/lib/prisma";
import { orderRepository } from "../../infrastructure/order.repository";
import { CreateOrderDTO } from "../../domain/dtos/order.dto";
import { generateOrderCode } from "@/lib/utils";

interface UseCaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createOrderUseCase(
  input: CreateOrderDTO
): Promise<UseCaseResult<{ id: string; code: string }>> {
  if (!input.items.length) {
    return { success: false, error: "O pedido precisa ter ao menos um item" };
  }

  const resolvedItems = [];
  let subtotal = 0;

  for (const item of input.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || !product.isAvailable) {
      return { success: false, error: `Produto indisponível: ${item.productId}` };
    }

    let unitPrice: number;
    let pizzaSelection: {
      sizeId: string;
      flavorOneId: string;
      flavorTwoId?: string | null;
      crustId?: string | null;
    } | null = null;

    if (item.pizza) {
      const size = await prisma.pizzaSize.findUnique({ where: { id: item.pizza.sizeId } });
      if (!size || !size.isActive) {
        return { success: false, error: "Tamanho de pizza inválido ou indisponível" };
      }

      const flavorOne = await prisma.product.findUnique({ where: { id: item.pizza.flavorOneId } });
      
      // A MÁGICA FOI AQUI: Removemos a obrigatoriedade do isFlavorEligible para o sabor principal.
      // Se a pessoa pediu a pizza inteira de um sabor só, ele não precisa dessa restrição!
      if (!flavorOne) {
        return { success: false, error: "Sabor principal inválido" };
      }

      if (item.pizza.flavorTwoId) {
        const flavorTwo = await prisma.product.findUnique({ where: { id: item.pizza.flavorTwoId } });
        // O sabor 2 (para pizza meio a meio) continua com a regra rigorosa
        if (!flavorTwo || !flavorTwo.isFlavorEligible) {
          return { success: false, error: "Sabor 2 inválido ou não elegível para meio a meio" };
        }
      }

      // Preço da pizza = preço do TAMANHO escolhido (fixo, compartilhado entre produtos)
      unitPrice = Number(size.price);

      if (item.pizza.crustId) {
        const crust = await prisma.pizzaCrust.findUnique({ where: { id: item.pizza.crustId } });
        if (!crust || !crust.isActive) {
          return { success: false, error: "Borda inválida ou indisponível" };
        }
        unitPrice += Number(crust.price);
      }

      pizzaSelection = {
        sizeId: item.pizza.sizeId,
        flavorOneId: item.pizza.flavorOneId,
        flavorTwoId: item.pizza.flavorTwoId ?? null,
        crustId: item.pizza.crustId ?? null,
      };
    } else {
      unitPrice =
        product.isPromoActive && product.promoPrice
          ? Number(product.promoPrice)
          : Number(product.originalPrice);
    }

    const addonsTotal = (item.selectedAddons ?? []).reduce((sum, a) => sum + a.price, 0);
    const totalPrice = (unitPrice + addonsTotal) * item.quantity;
    subtotal += totalPrice;

    resolvedItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      observation: item.observation ?? null,
      addons: item.selectedAddons ?? [],
      pizza: pizzaSelection,
    });
  }

  const total = subtotal + input.deliveryFee;

  const order = await orderRepository.create({
    code: generateOrderCode(),
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    addressComplement: input.addressComplement,
    neighborhood: input.neighborhood,
    paymentMethod: input.paymentMethod,
    subtotal,
    deliveryFee: input.deliveryFee,
    total,
    notes: input.notes,
    attendantId: input.attendantId,
    items: resolvedItems,
  });

  return { success: true, data: { id: order.id, code: order.code } };
}