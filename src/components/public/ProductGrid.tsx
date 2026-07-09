"use client";

import { useState } from "react";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { PizzaBuilderModal } from "./PizzaBuilderModal";

interface ProductGridProps {
  products: Omit<ProductCardProps, "onConfigurePizza">[];
  flavorOptions: { id: string; title: string; imageUrl: string; price: number }[];
}

export function ProductGrid({ products, flavorOptions }: ProductGridProps) {
  const [selectedPizza, setSelectedPizza] = useState<Omit<ProductCardProps, "onConfigurePizza"> | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onConfigurePizza={() => setSelectedPizza(product)}
          />
        ))}
      </div>

      {selectedPizza && (
        <PizzaBuilderModal
          product={{
            id: selectedPizza.id,
            title: selectedPizza.title,
            imageUrl: selectedPizza.imageUrl,
            isPizza: selectedPizza.isPizza,
            availableAddons: selectedPizza.addons, // Passando os adicionais do produto para o modal
          }}
          availableFlavors={flavorOptions}
          sizeOptions={selectedPizza.sizeOptions ?? []}
          onClose={() => setSelectedPizza(null)}
        />
      )}
    </>
  );
}