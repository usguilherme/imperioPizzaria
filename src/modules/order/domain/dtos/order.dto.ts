export interface SelectedAddonInput {
  name: string;
  price: number;
}

export interface PizzaSelectionInput {
  sizeId: string;
  flavorOneId: string;
  flavorTwoId?: string | null;
  crustId?: string | null;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  observation?: string | null;
  selectedAddons?: SelectedAddonInput[];
  // Presente somente quando o item é uma pizza (tamanho + sabor(es) + borda opcional)
  pizza?: PizzaSelectionInput | null;
}

export interface CreateOrderDTO {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  addressComplement?: string | null;
  neighborhood?: string | null;
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