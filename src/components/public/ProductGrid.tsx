"use client";

import { useState } from "react";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { PizzaBuilderModal } from "./PizzaBuilderModal";

// 🆕 Tipo da promoção de sabor por tamanho
interface FlavorSizePromo {
  sizeId: string;
  promoPrice: number;
}

interface ProductGridProps {
  products: Omit<ProductCardProps, "onConfigurePizza">[];
  flavorOptions: {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
    sizePromos?: FlavorSizePromo[];
  }[];
  // 🆕 Adicionamos a prop de busca que virá do seu Header
  searchQuery?: string;
}

export function ProductGrid({ products, flavorOptions, searchQuery = "" }: ProductGridProps) {
  const [selectedPizza, setSelectedPizza] = useState<Omit<ProductCardProps, "onConfigurePizza"> | null>(null);

  // 🆕 Lógica de filtragem: filtra pelo título ou descrição
  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onConfigurePizza={() => setSelectedPizza(product)}
          />
        ))}
        
        {/* Caso não encontre nada, exibe uma mensagem amigável */}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-10 text-center text-foreground-muted">
            Nenhum produto encontrado para "{searchQuery}"
          </div>
        )}
      </div>

      {selectedPizza && (
        <PizzaBuilderModal
          product={{
            id: selectedPizza.id,
            title: selectedPizza.title,
            imageUrl: selectedPizza.imageUrl,
            isPizza: selectedPizza.isPizza,
            // Tratamento de segurança para crusts
            availableCrusts: (selectedPizza as any).availableCrusts || (selectedPizza as any).crusts || [], 
            availableAddons: selectedPizza.addons,
          }}
          availableFlavors={flavorOptions}
          sizeOptions={selectedPizza.sizeOptions ?? []}
          onClose={() => setSelectedPizza(null)}
        />
      )}
    </>
  );
}