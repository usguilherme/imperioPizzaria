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

export interface SizeOption {
  id: string;
  name: string;
  price: number;
  maxFlavors: number;
}

interface PizzaBuilderModalProps {
  product: {
    id: string;
    title: string;
    imageUrl: string;
    isPizza?: boolean; // Adicionado para identificar se mostra sabores
  };
  availableFlavors: FlavorOption[];
  sizeOptions: SizeOption[];
  onClose: () => void;
}

export function PizzaBuilderModal({
  product,
  availableFlavors,
  sizeOptions,
  onClose,
}: PizzaBuilderModalProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorOption[]>([]);
  const [showSizeError, setShowSizeError] = useState(false);

  // Se não for pizza, podemos forçar o maxFlavors para 0 ou ignorar sabores
  const isPizza = product.isPizza ?? false;

  const toggleFlavor = (flavor: FlavorOption) => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }

    const isAlreadySelected = selectedFlavors.some((f) => f.id === flavor.id);
    if (isAlreadySelected) {
      setSelectedFlavors(selectedFlavors.filter((f) => f.id !== flavor.id));
      return;
    }

    if (selectedFlavors.length < selectedSize.maxFlavors) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    } else {
      alert(`Você só pode escolher até ${selectedSize.maxFlavors} sabores.`);
    }
  };

  const handleSelectSize = (size: SizeOption) => {
    setSelectedSize(size);
    setShowSizeError(false);
    if (selectedFlavors.length > size.maxFlavors) {
      setSelectedFlavors(selectedFlavors.slice(0, size.maxFlavors));
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }

    // Só exige sabores se for pizza
    if (isPizza && selectedFlavors.length === 0) {
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
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-bold text-foreground">Montar {product.title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-foreground-muted hover:bg-background-elevated hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          <section>
            <h3 className="mb-3 font-semibold text-foreground">1. Escolha o Tamanho <span className="text-primary">*</span></h3>
            <div className="grid grid-cols-2 gap-3">
              {sizeOptions.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSelectSize(size)}
                  className={`flex flex-col items-start rounded-xl border p-3 transition-colors ${
                    selectedSize?.id === size.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium text-foreground">{size.name}</div>
                  <div className="text-sm text-primary font-bold">{formatCurrency(size.price)}</div>
                </button>
              ))}
            </div>
            {showSizeError && <p className="mt-2 text-xs font-medium text-red-400">Selecione um tamanho primeiro.</p>}
          </section>

          {/* Renderiza sabores apenas se for pizza */}
          {isPizza && (
            <section className={!selectedSize ? "opacity-40 pointer-events-none" : ""}>
              <div className="mb-3 flex items-end justify-between">
                <h3 className="font-semibold text-foreground">2. Escolha os Sabores</h3>
                <span className="text-xs text-foreground-muted">
                  {selectedFlavors.length} de {selectedSize?.maxFlavors ?? "-"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableFlavors.map((flavor) => {
                  const isSelected = selectedFlavors.some((f) => f.id === flavor.id);
                  return (
                    <button key={flavor.id} onClick={() => toggleFlavor(flavor)} className={`flex items-center gap-3 rounded-xl border p-2 ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}>
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md"><Image src={flavor.imageUrl} alt={flavor.title} fill className="object-cover" /></div>
                      <div className="flex-1 text-left text-sm font-medium text-foreground">{flavor.title}</div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-primary bg-primary text-white" : "border-muted"}`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="border-t border-border bg-background-elevated p-4">
          <button onClick={handleAddToCart} disabled={!selectedSize} className="w-full rounded-xl bg-primary py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40">
            {selectedSize ? `Adicionar ao Carrinho - ${formatCurrency(selectedSize.price)}` : "Selecione um tamanho"}
          </button>
        </div>
      </div>
    </div>
  );
}