"use client";

import Image from "next/image";
import { Flame, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "next/navigation";

export interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  servesInfo?: string | null;
  originalPrice: number;
  promoPrice?: number | null;
  isPromoActive: boolean;
  isPizza?: boolean;
  addons?: { name: string; price: number }[];
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
  onConfigurePizza,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const hasDiscount = isPromoActive && promoPrice != null && promoPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - promoPrice!) / originalPrice) * 100)
    : 0;
  const finalPrice = hasDiscount ? promoPrice! : originalPrice;

  // Verifica se o lanche possui algum adicional cadastrado no banco
  const hasAddons = addons && addons.length > 0;

  const handleAction = () => {
    // 1. Se for pizza, aciona o modal de montar pizza
    if (isPizza) {
      if (onConfigurePizza) onConfigurePizza(id);
      return;
    }

    // 2. Se for um lanche com adicionais, leva para a tela de detalhes (ProductDetails)
    if (hasAddons) {
      router.push(`/produto/${id}`);
      return;
    }

    // 3. Se for lanche simples (sem adicionais), joga direto no carrinho
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
            <span>{servesInfo}</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-foreground-subtle line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <span className="font-display text-xl font-bold text-primary">
              {formatCurrency(finalPrice)}
            </span>
          </div>

          <button
            onClick={handleAction}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:scale-95"
          >
            {isPizza ? "Montar" : hasAddons ? "Personalizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}