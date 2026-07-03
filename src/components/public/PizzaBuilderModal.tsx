"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Check } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";

interface FlavorOption {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

interface PizzaBuilderModalProps {
  product: {
    id: string;
    title: string;
    imageUrl: string;
  };
  availableFlavors: FlavorOption[];
  onClose: () => void;
}

// Tamanhos fixos para o exemplo (se vierem do banco, você pode passar via props depois)
const SIZES = [
  { id: "size-m", name: "Média (6 Fatias)", price: 45.90, maxFlavors: 2 },
  { id: "size-g", name: "Grande (8 Fatias)", price: 59.90, maxFlavors: 2 },
];

export function PizzaBuilderModal({ product, availableFlavors, onClose }: PizzaBuilderModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  
  // CORREÇÃO: Tipagem forçada para garantir que o TypeScript entenda que não será undefined
  const [selectedSize, setSelectedSize] = useState<(typeof SIZES)[number]>(SIZES[1]!);
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorOption[]>([]);

  const toggleFlavor = (flavor: FlavorOption) => {
    const isAlreadySelected = selectedFlavors.some((f) => f.id === flavor.id);

    if (isAlreadySelected) {
      setSelectedFlavors(selectedFlavors.filter((f) => f.id !== flavor.id));
    } else {
      if (selectedFlavors.length < selectedSize.maxFlavors) {
        setSelectedFlavors([...selectedFlavors, flavor]);
      } else {
        alert(`Você só pode escolher até ${selectedSize.maxFlavors} sabores para este tamanho.`);
      }
    }
  };

  const handleAddToCart = () => {
    if (selectedFlavors.length === 0) {
      alert("Escolha pelo menos 1 sabor!");
      return;
    }

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: `${product.title} ${selectedSize.name}`,
      price: selectedSize.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      flavors: selectedFlavors.map((f) => ({ id: f.id, name: f.title })),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-background-surface shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-bold text-foreground">Montar {product.title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-foreground-muted hover:bg-background-elevated hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          
          {/* Escolha do Tamanho */}
          <section>
            <h3 className="mb-3 font-semibold text-foreground">1. Escolha o Tamanho</h3>
            <div className="grid grid-cols-2 gap-3">
              {SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => {
                    setSelectedSize(size);
                    if (selectedFlavors.length > size.maxFlavors) {
                      setSelectedFlavors(selectedFlavors.slice(0, size.maxFlavors));
                    }
                  }}
                  className={`flex flex-col items-start rounded-xl border p-3 transition-colors ${
                    selectedSize.id === size.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="font-medium text-foreground">{size.name}</span>
                  <span className="text-sm text-primary font-bold">{formatCurrency(size.price)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Escolha dos Sabores */}
          <section>
            <div className="mb-3 flex items-end justify-between">
              <h3 className="font-semibold text-foreground">2. Escolha os Sabores</h3>
              <span className="text-xs text-foreground-muted">
                {selectedFlavors.length} de {selectedSize.maxFlavors}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableFlavors.map((flavor) => {
                const isSelected = selectedFlavors.some((f) => f.id === flavor.id);
                return (
                  <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor)}
                    className={`flex items-center gap-3 rounded-xl border p-2 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                      <Image src={flavor.imageUrl} alt={flavor.title} fill className="object-cover" />
                    </div>
                    <span className="flex-1 text-left text-sm font-medium text-foreground line-clamp-2">
                      {flavor.title}
                    </span>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected ? "border-primary bg-primary text-white" : "border-muted"
                    }`}>
                      {isSelected && <Check size={12} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Rodapé fixo */}
        <div className="border-t border-border bg-background-elevated p-4">
          <button
            onClick={handleAddToCart}
            className="w-full rounded-xl bg-primary py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
          >
            Adicionar ao Carrinho - {formatCurrency(selectedSize.price)}
          </button>
        </div>

      </div>
    </div>
  );
}