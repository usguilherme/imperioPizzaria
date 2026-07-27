"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/Button"; 
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  originalPrice: number;
  type: "SIMPLE" | "PIZZA";
  addons: { name: string; price: number }[];
  availableFlavors?: { id: string; name: string }[];
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ProductDetails({ product }: { product: Product }) {
  const [selectedAddons, setSelectedAddons] = useState<{name: string, price: number}[]>([]);
  // NOVO: Estado para guardar os sabores extras escolhidos (até 2 extras)
  const [selectedFlavors, setSelectedFlavors] = useState<{id: string, name: string}[]>([]);
  
  const addItem = useCartStore((state) => state.addItem);
  const isPizza = product.type === "PIZZA";

  const toggleAddon = (addon: { name: string, price: number }) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.name === addon.name)
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  // Função para controlar a seleção de sabores
  const toggleFlavor = (flavor: { id: string, name: string }) => {
    setSelectedFlavors((prev) => {
      const exists = prev.find((f) => f.id === flavor.id);
      if (exists) {
        return prev.filter((f) => f.id !== flavor.id); // Remove
      } else {
        if (prev.length >= 2) {
          alert("Você pode adicionar no máximo mais 2 sabores (3 sabores no total).");
          return prev; // Ignora se tentar passar de 3 sabores
        }
        return [...prev, flavor]; // Adiciona
      }
    });
  };

  const total = Number(product.originalPrice) + selectedAddons.reduce((acc, curr) => acc + Number(curr.price), 0);

  const handleAddToCart = () => {
    // Array final de sabores: O sabor desta página + os extras que ele marcou
    const allFlavors = isPizza 
      ? [{ id: product.id, name: product.title }, ...selectedFlavors] 
      : undefined;

    addItem({
      id: generateId(),
      productId: product.id,
      name: product.title,
      price: Number(product.originalPrice),
      quantity: 1,
      selectedAddons: selectedAddons.length > 0 ? selectedAddons : undefined,
      flavors: allFlavors, 
      
      // IMPORTANTE: Enviamos um ID genérico por enquanto para o carrinho 
      // não agrupar as pizzas incorretamente.
      sizeId: isPizza ? "escolher-tamanho-depois" : undefined, 
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      
      {/* SEÇÃO DE SABORES (Apenas para Pizzas) */}
      {isPizza && product.availableFlavors && product.availableFlavors.length > 0 && (
        <div className="space-y-2 mb-6">
          <h3 className="font-medium text-sm">Adicionar mais sabores? (Até 2 extras)</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Sabor 1: {product.title} (Já incluso)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            {product.availableFlavors.map((flavor) => (
              <label key={flavor.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="checkbox" 
                  checked={!!selectedFlavors.find(f => f.id === flavor.id)}
                  onChange={() => toggleFlavor(flavor)} 
                  className="w-4 h-4"
                />
                {flavor.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO DE ADICIONAIS */}
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