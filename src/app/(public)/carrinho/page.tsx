"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  // 1. Removemos o subtotal daqui
  const { items, removeItem, updateQuantity } = useCartStore();

  // 2. Calculamos o subtotal manualmente multiplicando o preço pela quantidade
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-foreground-muted">Seu carrinho está vazio.</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Seu Carrinho</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id} // Atualizado para usar item.id
            className="flex gap-3 rounded-lg border border-border bg-background-surface p-3"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-background-elevated">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              )}
            </div>

            <div className="flex flex-1 flex-col">
              {/* Atualizado para usar item.name */}
              <p className="text-sm font-semibold text-foreground">{item.name}</p>
              
              {/* MOSTRA O TAMANHO DA PIZZA SE EXISTIR */}
              {item.sizeName && (
                <p className="text-xs text-foreground-subtle">
                  Tamanho: <span className="font-medium text-foreground">{item.sizeName}</span>
                </p>
              )}

              {/* MOSTRA OS SABORES DA PIZZA SE EXISTIR */}
              {item.flavors && item.flavors.length > 0 && (
                <p className="text-xs text-foreground-subtle">
                  Sabores: {item.flavors.map(f => f.name).join(", ")}
                </p>
              )}

              {/* Atualizado para usar item.price */}
              <p className="mt-1 text-sm font-bold text-primary">
                {formatCurrency(item.price * item.quantity)}
              </p>

              <div className="mt-auto flex items-center gap-3 pt-2">
                <button
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-background-elevated text-foreground-muted"
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm text-foreground">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-background-elevated text-foreground-muted"
                >
                  <Plus size={12} />
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-auto text-foreground-subtle hover:text-primary"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-foreground-muted">Subtotal</span>
        <span className="font-display text-xl font-bold text-primary">
          {formatCurrency(subtotal)} {/* Usa a nossa variável calculada lá em cima */}
        </span>
      </div>

      <Link href="/checkout" className="block mt-4">
        <Button className="w-full" size="lg">
          Ir para o checkout
        </Button>
      </Link>
    </div>
  );
}