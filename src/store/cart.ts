import { create } from 'zustand';

// Tipagem do que é um item dentro do carrinho
export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  imagemUrl: string | null;
  quantidade: number;
}

// Tipagem das funções que o nosso carrinho vai ter
interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantidade'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

// Criação do estado global do carrinho
export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (novoItem) => {
    set((state) => {
      // Verifica se a pizza já está no carrinho
      const itemExistente = state.items.find((item) => item.id === novoItem.id);
      
      if (itemExistente) {
        // Se já tem, só aumenta a quantidade
        return {
          items: state.items.map((item) =>
            item.id === novoItem.id
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          ),
        };
      }
      
      // Se não tem, adiciona a pizza com quantidade 1
      return { items: [...state.items, { ...novoItem, quantidade: 1 }] };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.preco * item.quantidade, 0);
  },
}));