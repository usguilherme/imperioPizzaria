import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartFlavor {
  id: string;
  name: string;
}

export interface CartAddon {
  name: string;
  price: number;
}

export interface CartItem {
  id: string; 
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  
  // Dados específicos para Pizzas
  sizeId?: string;
  sizeName?: string;
  flavors?: CartFlavor[];
  
  // Adicionais
  selectedAddons?: CartAddon[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (item) =>
        set((state) => {
          // Itens com adicionais ou tamanhos específicos não são agrupados
          if (!item.sizeId && (!item.selectedAddons || item.selectedAddons.length === 0)) {
            const existingItem = state.items.find((i) => i.productId === item.productId);
            if (existingItem) {
              return {
                items: state.items.map((i) =>
                  i.productId === item.productId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                ),
              };
            }
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "imperio-cart-storage",
    }
  )
);