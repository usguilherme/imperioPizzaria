import { productRepository } from "@/modules/product/infrastructure/product.repository";
import { orderRepository } from "../../infrastructure/order.repository";
import { CreateOrderDTO } from "../../domain/dtos/order.dto";
import { calculatePizzaPriceUseCase } from "./calculate-pizza-price.usecase";
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
    let unitPrice: number;

    if (item.pizzaFlavors) {
      const pizzaPrice = await calculatePizzaPriceUseCase(
        item.pizzaFlavors.flavorOneId,
        item.pizzaFlavors.flavorTwoId
      );
      if (!pizzaPrice.success || pizzaPrice.unitPrice == null) {
        return { success: false, error: pizzaPrice.error ?? "Erro ao calcular preço da pizza" };
      }
      unitPrice = pizzaPrice.unitPrice;
    } else {
      const product = await productRepository.findById(item.productId);
      if (!product || !product.isAvailable) {
        return { success: false, error: `Produto indisponível: ${item.productId}` };
      }
      unitPrice =
        product.isPromoActive && product.promoPrice
          ? Number(product.promoPrice)
          : Number(product.originalPrice);
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    resolvedItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      observation: item.observation ?? null,
      pizzaFlavors: item.pizzaFlavors ?? null,
    });
  }

  const total = subtotal + input.deliveryFee;

  const order = await orderRepository.create({
    code: generateOrderCode(),
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    addressComplement: input.addressComplement,
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
