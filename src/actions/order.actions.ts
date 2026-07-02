"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/auth.config";
import { createOrderUseCase } from "@/modules/order/application/use-cases/create-order.usecase";
import { updateOrderStatusUseCase } from "@/modules/order/application/use-cases/update-order-status.usecase";
import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { CreateOrderDTO } from "@/modules/order/domain/dtos/order.dto";

/** Chamada pelo checkout público — não exige autenticação. */
export async function createOrderAction(input: CreateOrderDTO) {
  const result = await createOrderUseCase(input);
  if (result.success) {
    revalidatePath("/admin/pedidos");
  }
  return result;
}

/** Chamada pelo Kanban do admin — exige sessão. */
export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autorizado");

  const order = await orderRepository.findById(orderId);
  if (!order) return { success: false, error: "Pedido não encontrado" };

  const result = await updateOrderStatusUseCase(orderId, order.status, newStatus);
  if (result.success) {
    revalidatePath("/admin/pedidos");
  }
  return result;
}
