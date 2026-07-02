"use client";

import { useState } from "react";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { PizzaBuilderModal, FlavorOption } from "./PizzaBuilderModal";

interface ProductGridProps {
  products: Omit<ProductCardProps, "onConfigurePizza">[];
  flavorOptions: FlavorOption[];
}

export function ProductGrid({ products, flavorOptions }: ProductGridProps) {
  const [isPizzaModalOpen, setIsPizzaModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onConfigurePizza={() => setIsPizzaModalOpen(true)}
          />
        ))}
      </div>

      <PizzaBuilderModal
        isOpen={isPizzaModalOpen}
        onClose={() => setIsPizzaModalOpen(false)}
        flavors={flavorOptions}
      />
    </>
  );
}
