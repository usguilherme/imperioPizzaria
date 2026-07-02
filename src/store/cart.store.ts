import { create } from "zustand";

export interface CartPizzaFlavors {
  flavorOneId: string;
  flavorOneTitle: string;
  flavorTwoId?: string | null;
  flavorTwoTitle?: string | null;
}

export interface CartItem {
  cartItemId: string; // id local único (permite 2 pizzas iguais em linhas separadas)
  productId: string;
  title: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  observation?: string | null;
  pizzaFlavors?: CartPizzaFlavors | null;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "cartItemId">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { ...item, cartItemId: crypto.randomUUID() },
      ],
    })),

  removeItem: (cartItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    })),

  updateQuantity: (cartItemId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    })),

  clearCart: () => set({ items: [] }),

  subtotal: () =>
    get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
}));
