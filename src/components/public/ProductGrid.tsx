"use client";

import { useState } from "react";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { PizzaBuilderModal } from "./PizzaBuilderModal";

interface ProductGridProps {
  products: Omit<ProductCardProps, "onConfigurePizza">[];
  // O tipo foi declarado direto aqui, já que removemos do modal
  flavorOptions: { id: string; title: string }[];
}

export function ProductGrid({ products, flavorOptions }: ProductGridProps) {
  // Em vez de só um boolean, guardamos a pizza exata que o cliente clicou
  const [selectedPizza, setSelectedPizza] = useState<Omit<ProductCardProps, "onConfigurePizza"> | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            // Quando clica em montar, salva o produto no state
            onConfigurePizza={() => setSelectedPizza(product)}
          />
        ))}
      </div>

      {/* Renderiza o modal apenas se existir uma pizza selecionada */}
      {selectedPizza && (
        <PizzaBuilderModal
          product={{
            id: selectedPizza.id,
            title: selectedPizza.title,
            imageUrl: selectedPizza.imageUrl,
          }}
          availableFlavors={flavorOptions}
          onClose={() => setSelectedPizza(null)}
        />
      )}
    </>
  );
}