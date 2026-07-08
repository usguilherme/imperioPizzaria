"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/Button"; // Ajuste o caminho se seu botão vier de outro lugar
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  originalPrice: number;
  type: "SIMPLE" | "PIZZA";
  addons: { name: string; price: number }[];
}

export function ProductDetails({ product }: { product: Product }) {
  const [selectedAddons, setSelectedAddons] = useState<{name: string, price: number}[]>([]);
  
  // Usando addItem para bater com o seu cart.store.ts
  const addItem = useCartStore((state) => state.addItem);

  const toggleAddon = (addon: { name: string, price: number }) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.name === addon.name)
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  // Calcula o total apenas para exibição no botão desta tela
  const total = Number(product.originalPrice) + selectedAddons.reduce((acc, curr) => acc + Number(curr.price), 0);

  const handleAddToCart = () => {
    // Montando o objeto exatamente como a sua interface CartItem exige
    addItem({
      id: crypto.randomUUID(), // Gera um ID único para este item no carrinho
      productId: product.id,
      name: product.title,
      price: Number(product.originalPrice), // Envia o preço base, o store calcula o resto
      quantity: 1, // Quantidade inicial padrão
      selectedAddons: selectedAddons.length > 0 ? selectedAddons : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      
      {product.addons && product.addons.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Adicionais</h3>
          {product.addons.map((addon) => (
            <label key={addon.name} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                onChange={() => toggleAddon(addon)} 
                className="w-4 h-4"
              />
              {addon.name} (+{formatCurrency(Number(addon.price))})
            </label>
          ))}
        </div>
      )}

      <Button onClick={handleAddToCart} className="w-full">
        Adicionar ao carrinho - {formatCurrency(total)}
      </Button>
    </div>
  );
}