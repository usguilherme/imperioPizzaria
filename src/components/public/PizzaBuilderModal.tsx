"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Check } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";

export interface FlavorOption {
  id: string;
  title: string;
  imageUrl: string;
  price: number; // já resolvido (promo ou original)
}

interface PizzaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  flavors: FlavorOption[];
}

export function PizzaBuilderModal({ isOpen, onClose, flavors }: PizzaBuilderModalProps) {
  const [flavorOneId, setFlavorOneId] = useState<string | null>(null);
  const [flavorTwoId, setFlavorTwoId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen) return null;

  const flavorOne = flavors.find((f) => f.id === flavorOneId) ?? null;
  const flavorTwo = flavors.find((f) => f.id === flavorTwoId) ?? null;

  // Regra: cobra-se o valor do sabor mais caro (espelha o use-case do backend)
  const unitPrice = Math.max(flavorOne?.price ?? 0, flavorTwo?.price ?? 0);

  const handleSelectFlavor = (id: string) => {
    if (flavorOneId === id) {
      setFlavorOneId(null);
      return;
    }
    if (flavorTwoId === id) {
      setFlavorTwoId(null);
      return;
    }
    if (!flavorOneId) {
      setFlavorOneId(id);
    } else if (!flavorTwoId) {
      setFlavorTwoId(id);
    }
  };

  const handleConfirm = () => {
    if (!flavorOne) return;

    addItem({
      productId: flavorOne.id,
      title: flavorTwo ? `Pizza ${flavorOne.title} / ${flavorTwo.title}` : `Pizza ${flavorOne.title}`,
      imageUrl: flavorOne.imageUrl,
      unitPrice,
      quantity: 1,
      pizzaFlavors: {
        flavorOneId: flavorOne.id,
        flavorOneTitle: flavorOne.title,
        flavorTwoId: flavorTwo?.id ?? null,
        flavorTwoTitle: flavorTwo?.title ?? null,
      },
    });

    setFlavorOneId(null);
    setFlavorTwoId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background-surface border border-border md:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background-surface p-4">
          <h2 className="font-display text-lg font-bold text-foreground">
            Monte sua Pizza (até 2 sabores)
          </h2>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground">
            <X size={22} />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4 text-sm text-foreground-muted">
            Escolha 1 ou 2 sabores. O valor cobrado é sempre o do sabor de maior preço.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {flavors.map((flavor) => {
              const isSelected = flavor.id === flavorOneId || flavor.id === flavorTwoId;
              const isDisabled = !isSelected && !!flavorOneId && !!flavorTwoId;

              return (
                <button
                  key={flavor.id}
                  disabled={isDisabled}
                  onClick={() => handleSelectFlavor(flavor.id)}
                  className={cn(
                    "relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-all",
                    isSelected ? "border-primary" : "border-border",
                    isDisabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={12} />
                    </div>
                  )}
                  <div className="relative aspect-square w-full bg-background-elevated">
                    <Image src={flavor.imageUrl} alt={flavor.title} fill className="object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {flavor.title}
                    </p>
                    <p className="text-xs text-primary font-bold">{formatCurrency(flavor.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-foreground-muted">Total</span>
            <span className="font-display text-xl font-bold text-primary">
              {formatCurrency(unitPrice)}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!flavorOne}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
