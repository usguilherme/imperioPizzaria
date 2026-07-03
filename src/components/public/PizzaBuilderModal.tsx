"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { getActivePizzaSizesAction } from "@/actions/pizza-size.actions";
import { useCartStore, CartFlavor } from "@/store/cart.store";

interface PizzaBuilderModalProps {
  product: {
    id: string;
    title: string;
    imageUrl: string;
  };
  availableFlavors: { id: string; title: string }[];
  onClose: () => void;
}

interface SizeData {
  id: string;
  name: string;
  price: number;
  maxFlavors: number;
}

export function PizzaBuilderModal({ product, availableFlavors, onClose }: PizzaBuilderModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  
  const [sizes, setSizes] = useState<SizeData[]>([]);
  const [isLoadingSizes, setIsLoadingSizes] = useState(true);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSize, setSelectedSize] = useState<SizeData | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<CartFlavor[]>([]);

  useEffect(() => {
    async function loadSizes() {
      const activeSizes = await getActivePizzaSizesAction();
      setSizes(activeSizes);
      setIsLoadingSizes(false);
    }
    loadSizes();
  }, []);

  const toggleFlavor = (flavor: { id: string; title: string }) => {
    if (!selectedSize) return;

    setSelectedFlavors((prev) => {
      const isAlreadySelected = prev.some((f) => f.id === flavor.id);
      
      if (isAlreadySelected) {
        return prev.filter((f) => f.id !== flavor.id);
      }
      if (prev.length < selectedSize.maxFlavors) {
        return [...prev, { id: flavor.id, name: flavor.title }];
      }
      return prev; 
    });
  };

  const handleAddToCart = () => {
    if (!selectedSize || selectedFlavors.length === 0) return;

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.title,
      price: selectedSize.price, 
      quantity: 1,
      imageUrl: product.imageUrl,
      flavors: selectedFlavors,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-background-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-bold text-foreground">
            Montar {product.title}
          </h2>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-medium text-foreground">1. Escolha o Tamanho</h3>
                <p className="text-sm text-foreground-subtle">Isso define o valor da sua pizza.</p>
              </div>

              {isLoadingSizes ? (
                <p className="text-center text-sm text-foreground-muted">Carregando tamanhos...</p>
              ) : (
                <div className="grid gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                        selectedSize?.id === size.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background-elevated hover:border-primary/50"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-foreground">{size.name}</p>
                        <p className="text-xs text-foreground-muted">Até {size.maxFlavors} sabores</p>
                      </div>
                      <p className="font-bold text-primary">{formatCurrency(size.price)}</p>
                    </button>
                  ))}
                </div>
              )}

              <Button 
                className="mt-6 w-full" 
                disabled={!selectedSize} 
                onClick={() => setStep(2)}
              >
                Avançar para Sabores
              </Button>
            </div>
          )}

          {step === 2 && selectedSize && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">2. Escolha os Sabores</h3>
                  <p className="text-sm text-foreground-subtle">
                    Tamanho {selectedSize.name}: Escolha até {selectedSize.maxFlavors}.
                  </p>
                </div>
                <button 
                  onClick={() => setStep(1)} 
                  className="text-sm text-primary hover:underline"
                >
                  Trocar tamanho
                </button>
              </div>

              <div className="grid max-h-64 gap-2 overflow-y-auto pr-2">
                {availableFlavors.map((flavor) => {
                  const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                  const isDisabled = !isSelected && selectedFlavors.length >= selectedSize.maxFlavors;

                  return (
                    <button
                      key={flavor.id}
                      disabled={isDisabled}
                      onClick={() => toggleFlavor(flavor)}
                      className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : isDisabled
                          ? "cursor-not-allowed border-border bg-background/50 opacity-50"
                          : "border-border bg-background-elevated hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">{flavor.title}</span>
                      {isSelected && <Check size={18} className="text-primary" />}
                    </button>
                  );
                })}
              </div>

              <Button 
                className="mt-6 w-full" 
                disabled={selectedFlavors.length === 0} 
                onClick={handleAddToCart}
              >
                Adicionar ao Carrinho - {formatCurrency(selectedSize.price)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}