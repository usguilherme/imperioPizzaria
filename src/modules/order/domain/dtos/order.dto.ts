export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  observation?: string | null;
  // Preenchido apenas quando o item é uma pizza
  pizzaFlavors?: {
    sizeId: string; // Adicionado aqui para permitir o fluxo de dados no UseCase e Repositório
    flavorOneId: string;
    flavorTwoId?: string | null;
  } | null;
}

export interface CreateOrderDTO {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  addressComplement?: string | null;
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
  deliveryFee: number;
  notes?: string | null;
  items: CreateOrderItemInput[];
  attendantId?: string | null;
}

export type OrderStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

export interface OrderListItemDTO {
  id: string;
  code: string;
  customerName: string;
  status: OrderStatusValue;
  total: number;
  itemsCount: number;
  createdAt: string;
}