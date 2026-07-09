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
  sizePromos?: { sizeId: string; promoPrice: number }[];
}

export interface SizeOption {
  id: string;
  name: string;
  price: number;
  maxFlavors: number;
}

interface CrustOption {
  id: string;
  name: string;
  price: number;
  sizeId: string;
}

interface PizzaBuilderModalProps {
  product: {
    id: string;
    title: string;
    imageUrl: string;
    isPizza?: boolean;
    availableCrusts?: CrustOption[];
    availableAddons?: { name: string; price: number }[];
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
  const [selectedCrust, setSelectedCrust] = useState<CrustOption | null>(null);

  const isPizza = product.isPizza ?? false;
  const crusts = product.availableCrusts ?? [];

  // Filtra bordas pelo tamanho selecionado
  const filteredCrusts = crusts.filter(c => c.sizeId === selectedSize?.id);

  // BUSCA A PROMOÇÃO: Verifica se um sabor específico tem promoção para um tamanho específico
  const getPromoForFlavor = (flavorId: string, sizeId: string) => {
    const flavor = availableFlavors.find((f) => f.id === flavorId);
    return flavor?.sizePromos?.find((p) => p.sizeId === sizeId)?.promoPrice;
  };

  // CALCULA PREÇO EFETIVO: Define se o tamanho vai usar o preço normal ou o promocional
  const getEffectiveSizePrice = (size: SizeOption) => {
    if (isPizza) {
      // Regra 1: Se o cliente selecionou exatamente 1 sabor, verifica a promo dele
      // Adicionado selectedFlavors[0] para satisfazer a checagem rigorosa do TS
      if (selectedFlavors.length === 1 && selectedFlavors[0]) {
        const promo = getPromoForFlavor(selectedFlavors[0].id, size.id);
        if (promo !== undefined) return promo;
      }
      // Regra 2: Se o cliente ainda não selecionou sabores, mostramos o preço baseado no sabor da vitrine
      if (selectedFlavors.length === 0) {
        const promo = getPromoForFlavor(product.id, size.id);
        if (promo !== undefined) return promo;
      }
      // Regra 3: Se escolheu 2 ou mais sabores (meio a meio), volta pro preço normal
      return size.price;
    }
    
    // Para lanches/itens simples
    const promo = getPromoForFlavor(product.id, size.id);
    return promo !== undefined ? promo : size.price;
  };

  const toggleFlavor = (flavor: FlavorOption) => {
    const isAlreadySelected = selectedFlavors.some((f) => f.id === flavor.id);
    if (isAlreadySelected) {
      setSelectedFlavors(selectedFlavors.filter((f) => f.id !== flavor.id));
    } else if (selectedSize && selectedFlavors.length < selectedSize.maxFlavors) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleSelectSize = (size: SizeOption) => {
    setSelectedSize(size);
    setSelectedFlavors([]);
    setSelectedCrust(null);
  };

  // Recalcula os totais com base no preço efetivo (com ou sem promoção)
  const currentSizeEffectivePrice = selectedSize ? getEffectiveSizePrice(selectedSize) : 0;
  const totalPrice = currentSizeEffectivePrice + (selectedCrust?.price || 0);
  const isPromoApplied = selectedSize && currentSizeEffectivePrice < selectedSize.price;

  const handleAddToCart = () => {
    if (!selectedSize) { alert("Selecione um tamanho!"); return; }
    if (isPizza && selectedFlavors.length === 0) { alert("Escolha pelo menos 1 sabor!"); return; }

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: `${product.title} ${selectedSize.name} ${selectedCrust ? `(Borda: ${selectedCrust.name})` : ""}`,
      price: currentSizeEffectivePrice + (selectedCrust?.price ?? 0),
      quantity: 1,
      imageUrl: product.imageUrl,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      flavors: selectedFlavors.map((f) => ({ id: f.id, name: f.title })),
      crustId: selectedCrust?.id ?? null,
      crustName: selectedCrust?.name ?? null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-background-surface rounded-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-foreground">Montar {product.title}</h2>
          <button onClick={onClose} className="p-2 text-foreground-muted hover:text-foreground"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {/* 1. Tamanho */}
          <section>
            <h3 className="mb-3 font-semibold text-foreground">1. Escolha o Tamanho *</h3>
            <div className="grid grid-cols-2 gap-3">
              {sizeOptions.map((size) => {
                const effectivePrice = getEffectiveSizePrice(size);
                const hasPromo = effectivePrice < size.price;

                return (
                  <button key={size.id} onClick={() => handleSelectSize(size)} className={`p-3 flex flex-col items-center justify-center rounded-xl border ${selectedSize?.id === size.id ? "border-primary bg-primary/10" : "border-border"}`}>
                    <div className="font-medium text-foreground">{size.name}</div>
                    <div className="flex items-center gap-2">
                      {hasPromo && <span className="text-xs line-through text-foreground-muted">{formatCurrency(size.price)}</span>}
                      <span className="text-sm text-primary font-bold">{formatCurrency(effectivePrice)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Sabores */}
          {isPizza && (
            <section className={!selectedSize ? "opacity-40 pointer-events-none" : ""}>
              <h3 className="mb-3 font-semibold text-foreground">2. Escolha os Sabores</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableFlavors.map((flavor) => {
                  const isSelected = selectedFlavors.some((f) => f.id === flavor.id);
                  const promoPrice = selectedSize ? getPromoForFlavor(flavor.id, selectedSize.id) : undefined;

                  return (
                    <button key={flavor.id} onClick={() => toggleFlavor(flavor)} className={`flex items-center gap-3 p-2 rounded-xl border text-left ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}>
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded"><Image src={flavor.imageUrl} alt={flavor.title} fill className="object-cover" /></div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-sm text-foreground line-clamp-1">{flavor.title}</span>
                        {promoPrice !== undefined && (
                          <span className="text-[10px] text-primary font-semibold w-fit">
                            🔥 Promocional: {formatCurrency(promoPrice)}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check size={16} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3. Bordas (Filtra pelo tamanho selecionado) */}
          {filteredCrusts.length > 0 && (
            <section className={!selectedSize ? "opacity-40 pointer-events-none" : ""}>
              <h3 className="mb-3 font-semibold text-foreground">3. Escolha a Borda (Opcional)</h3>
              <div className="space-y-2">
                {filteredCrusts.map((crust) => (
                  <button key={crust.id} onClick={() => setSelectedCrust(crust)} className={`w-full flex justify-between p-3 rounded-xl border ${selectedCrust?.id === crust.id ? "border-primary bg-primary/5" : "border-border"}`}>
                    <span className="text-foreground">{crust.name}</span>
                    <span className="font-bold text-primary">+ {formatCurrency(crust.price)}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background-elevated">
          {isPromoApplied && (
            <div className="text-center text-primary text-xs font-bold mb-3 uppercase tracking-wide">
              🔥 Preço promocional de sabor único aplicado
            </div>
          )}
          
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || (isPizza && selectedFlavors.length === 0)}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold transition-transform hover:scale-[1.02] disabled:opacity-50"
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