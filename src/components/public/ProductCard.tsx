"use client";

import Image from "next/image";
import { Flame, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "next/navigation";
import { SizeOption } from "./PizzaBuilderModal";

export interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  servesInfo?: string | null;
  originalPrice: number | null;
  promoPrice?: number | null;
  isPromoActive: boolean;
  isPizza?: boolean;
  addons?: { name: string; price: number }[];
  sizeOptions?: SizeOption[];
  onConfigurePizza?: (productId: string) => void;
}

export function ProductCard({
  id,
  title,
  description,
  imageUrl,
  servesInfo,
  originalPrice,
  promoPrice,
  isPromoActive,
  isPizza = false,
  addons = [],
  sizeOptions = [],
  onConfigurePizza,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const hasDiscount = isPromoActive && promoPrice != null && originalPrice != null && promoPrice < originalPrice;
  const discountPercent =
    hasDiscount && originalPrice ? Math.round(((originalPrice - promoPrice!) / originalPrice) * 100) : 0;
  const finalPrice = hasDiscount ? promoPrice! : originalPrice ?? 0;

  const hasAddons = addons && addons.length > 0;
  const hasSizes = sizeOptions && sizeOptions.length > 0;

  const handleAction = () => {
    // Se for pizza OU se o produto tiver tamanhos cadastrados, abre o modal de configuração
    if (isPizza || hasSizes) {
      if (onConfigurePizza) onConfigurePizza(id);
      return;
    }

    // Lanche com adicionais -> tela de detalhes
    if (hasAddons) {
      router.push(`/produto/${id}`);
      return;
    }

    // Lanche simples -> direto no carrinho
    addItem({
      id: crypto.randomUUID(),
      productId: id,
      name: title,
      price: finalPrice,
      quantity: 1,
      imageUrl: imageUrl,
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card bg-background-surface border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-glow-primary">
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-gradient-promo px-3 py-1 text-xs font-bold text-white shadow-lg">
          <Flame size={12} />
          -{discountPercent}%
        </div>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-elevated">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized={imageUrl.startsWith("data:")}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
          {title}
        </h3>

        <p className="text-sm text-foreground-muted line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>

        {servesInfo && (
          <div className="flex items-center gap-1.5 text-xs text-accent">
            <Users size={14} />
            <div className="inline-block">{servesInfo}</div>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            {hasDiscount && (
              <div className="text-xs text-foreground-subtle line-through">
                {formatCurrency(originalPrice!)}
              </div>
            )}
            <div className="font-display text-xl font-bold text-primary">
              {formatCurrency(finalPrice)}
            </div>
          </div>

          <button
            onClick={handleAction}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:scale-95"
          >
            {isPizza || hasSizes ? "Montar" : hasAddons ? "Personalizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}