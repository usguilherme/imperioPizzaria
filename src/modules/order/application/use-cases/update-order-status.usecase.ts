import { OrderStatus } from "@prisma/client";
import { orderRepository } from "../../infrastructure/order.repository";

interface UseCaseResult {
  success: boolean;
  error?: string;
}

// Transições válidas — evita, por exemplo, voltar de DELIVERED para PENDING sem querer.
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["IN_PREPARATION", "CANCELED"],
  IN_PREPARATION: ["READY", "CANCELED"],
  READY: ["OUT_FOR_DELIVERY", "CANCELED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELED: [],
};

export async function updateOrderStatusUseCase(
  orderId: string,
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<UseCaseResult> {
  const allowed = VALID_TRANSITIONS[currentStatus];

  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Transição inválida: ${currentStatus} -> ${newStatus}`,
    };
  }

  await orderRepository.updateStatus(orderId, newStatus);
  return { success: true };
}
