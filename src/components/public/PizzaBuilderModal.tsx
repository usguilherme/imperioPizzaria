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

interface Addon {
  name: string;
  price: number;
}

interface PizzaBuilderModalProps {
  product: {
    id: string;
    title: string;
    imageUrl: string;
    isPizza?: boolean;
    availableAddons?: Addon[];
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
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const isPizza = product.isPizza ?? false;
  const addons = product.availableAddons ?? [];

  const toggleFlavor = (flavor: FlavorOption) => {
    const isAlreadySelected = selectedFlavors.some((f) => f.id === flavor.id);
    if (isAlreadySelected) {
      setSelectedFlavors(selectedFlavors.filter((f) => f.id !== flavor.id));
    } else if (selectedSize && selectedFlavors.length < selectedSize.maxFlavors) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const toggleAddon = (addon: Addon) => {
    const isSelected = selectedAddons.some((a) => a.name === addon.name);
    if (isSelected) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) { alert("Selecione um tamanho!"); return; }
    if (isPizza && selectedFlavors.length === 0) { alert("Escolha pelo menos 1 sabor!"); return; }

    const totalAddonsPrice = selectedAddons.reduce((acc, a) => acc + a.price, 0);

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: `${product.title} ${selectedSize.name}`,
      price: selectedSize.price + totalAddonsPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      flavors: selectedFlavors.map((f) => ({ id: f.id, name: f.title })),
      selectedAddons: selectedAddons,
    });
    onClose();
  };

  const totalPrice = (selectedSize?.price || 0) + selectedAddons.reduce((acc, a) => acc + a.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-background-surface shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-bold text-foreground">Montar {product.title}</h2>
          <button onClick={onClose} className="p-2 text-foreground-muted hover:text-foreground"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {/* 1. Tamanho */}
          <section>
            <h3 className="mb-3 font-semibold text-foreground">1. Escolha o Tamanho *</h3>
            <div className="grid grid-cols-2 gap-3">
              {sizeOptions.map((size) => (
                <button key={size.id} onClick={() => { setSelectedSize(size); setSelectedFlavors([]); }} className={`p-3 rounded-xl border ${selectedSize?.id === size.id ? "border-primary bg-primary/10" : "border-border"}`}>
                  <div className="font-medium">{size.name}</div>
                  <div className="text-sm text-primary font-bold">{formatCurrency(size.price)}</div>
                </button>
              ))}
            </div>
          </section>

          {/* 2. Sabores (Bloqueado se não tiver tamanho) */}
          {isPizza && (
            <section className={!selectedSize ? "opacity-40 pointer-events-none transition-opacity" : "transition-opacity"}>
              <h3 className="mb-3 font-semibold text-foreground">2. Escolha os Sabores {selectedSize ? `(até ${selectedSize.maxFlavors})` : ""}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableFlavors.map((flavor) => {
                  const isSelected = selectedFlavors.some((f) => f.id === flavor.id);
                  return (
                    <button key={flavor.id} onClick={() => toggleFlavor(flavor)} className={`flex items-center gap-3 p-2 rounded-xl border ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}>
                      <div className="relative h-10 w-10 overflow-hidden rounded"><Image src={flavor.imageUrl} alt={flavor.title} fill className="object-cover" /></div>
                      <span className="flex-1 text-sm">{flavor.title}</span>
                      {isSelected && <Check size={16} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3. Adicionais (Bloqueado se não tiver tamanho) */}
          {addons.length > 0 && (
            <section className={!selectedSize ? "opacity-40 pointer-events-none transition-opacity" : "transition-opacity"}>
              <h3 className="mb-3 font-semibold text-foreground">3. Adicionais (Opcional)</h3>
              <div className="space-y-2">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <button key={addon.name} onClick={() => toggleAddon(addon)} className={`w-full flex justify-between p-3 rounded-xl border ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}>
                      <span>{addon.name}</span>
                      <span className="font-bold">{formatCurrency(addon.price)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="border-t border-border p-4 bg-background-elevated">
          <button 
            onClick={handleAddToCart} 
            disabled={!selectedSize || (isPizza && selectedFlavors.length === 0)} 
            className="w-full rounded-xl bg-primary py-3 font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedSize 
              ? (isPizza && selectedFlavors.length === 0 ? "Escolha os sabores" : `Adicionar - ${formatCurrency(totalPrice)}`) 
              : "Selecione um tamanho"}
          </button>
        </div>
      </div>
    </div>
  );
}