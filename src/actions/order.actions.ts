"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/auth.config";
import { createOrderUseCase } from "@/modules/order/application/use-cases/create-order.usecase";
import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { CreateOrderItemInput } from "@/modules/order/domain/dtos/order.dto";
import { CartItem } from "@/store/cart.store";

interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  addressComplement?: string | null;
  neighborhood?: string | null;
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
  deliveryFee: number;
  notes?: string | null;
}

interface CreateOrderActionResult {
  success: boolean;
  code?: string;
  error?: string;
}

/**
 * Converte os itens do carrinho (Zustand) para o formato que o use-case espera.
 * Pizza é identificada pela presença de sizeId; o resto é produto simples.
 */
function mapCartItemsToOrderPayload(items: CartItem[]): CreateOrderItemInput[] {
  return items.map((item) => {
    // Apenas verificamos se tem tamanho. Se tem, é pizza!
    const isPizza = !!(item as any).sizeId;
    const flavorsArr = (item as any).flavors || [];

    return {
      // Se for pizza de 1 sabor, o sabor principal é o próprio productId
      productId: isPizza && flavorsArr.length > 0 ? flavorsArr[0].id : item.productId,
      quantity: item.quantity,
      observation: undefined,
      selectedAddons: item.selectedAddons?.map((a) => ({ name: a.name, price: a.price })) ?? [],
      pizza: isPizza
        ? {
            sizeId: (item as any).sizeId,
            // Puxa o sabor 1 do array, ou do productId se for sabor único
            flavorOneId: flavorsArr.length > 0 ? flavorsArr[0].id : item.productId,
            flavorTwoId: flavorsArr.length > 1 ? flavorsArr[1].id : null,
            crustId: (item as any).crustId || null, 
          }
        : null,
    };
  });
}

/**
 * Chamada pelo checkout público — não exige autenticação.
 */
export async function createOrderAction(
  formData: CheckoutFormData,
  cartItems: CartItem[]
): Promise<CreateOrderActionResult> {
  const result = await createOrderUseCase({
    customerName: formData.customerName,
    customerPhone: formData.customerPhone,
    deliveryAddress: formData.deliveryAddress,
    addressComplement: formData.addressComplement ?? null,
    neighborhood: formData.neighborhood ?? null,
    paymentMethod: formData.paymentMethod,
    deliveryFee: formData.deliveryFee,
    notes: formData.notes ?? null,
    items: mapCartItemsToOrderPayload(cartItems),
  });

  if (!result.success || !result.data) {
    return { success: false, error: result.error ?? "Erro ao finalizar pedido" };
  }

  revalidatePath("/admin/pedidos");
  return { success: true, code: result.data.code };
}

/** Chamada pelo Kanban do admin — exige sessão. */
export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autorizado");

  const order = await orderRepository.findById(orderId);
  if (!order) return { success: false, error: "Pedido não encontrado" };

  await orderRepository.updateStatus(orderId, newStatus);
  revalidatePath("/admin/pedidos");
  return { success: true };
}

/** Chamada pelo Kanban do admin para excluir um pedido — exige sessão. */
export async function deleteOrderAction(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autorizado");

  try {
    await orderRepository.delete(orderId);
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    return { success: false, error: "Erro ao excluir o pedido." };
  }
}