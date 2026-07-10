"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const subtotal = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center px-4">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag size={48} />
        </div>
        <h1 className="mb-2 font-display text-2xl font-bold text-foreground">Seu carrinho está vazio</h1>
        <p className="mb-8 text-foreground-muted">Bateu aquela fome? Dê uma olhada no nosso cardápio!</p>
        <Link
          href="/"
          className="rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Ir para o Cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Seu Carrinho</h1>
        <button 
          onClick={clearCart}
          className="text-sm text-red-500 hover:underline"
        >
          Limpar Carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const addonsTotal = item.selectedAddons?.reduce((acc, addon) => acc + Number(addon.price), 0) || 0;
            const itemTotalUnitPrice = Number(item.price) + addonsTotal;
            
            return (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-border bg-background-surface p-4 shadow-sm">
                {item.imageUrl && (
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{item.name}</h3>
                    {item.flavors && item.flavors.length > 0 && (
                      <p className="text-sm text-foreground-muted mt-1">Sabores: {item.flavors.map(f => f.name).join(" e ")}</p>
                    )}
                    {(item as any).crustName && (
                      <p className="text-sm text-foreground-muted mt-1">Borda: {(item as any).crustName}</p>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="mt-1 text-sm text-foreground-muted">
                        <span className="font-medium">Adicionais: </span>
                        {item.selectedAddons.map((addon, index) => (
                          <span key={index}>{addon.name} (+{formatCurrency(addon.price)}){index < item.selectedAddons!.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-primary text-lg">{formatCurrency(itemTotalUnitPrice)}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center rounded-lg border border-border bg-background-elevated">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 text-foreground-muted hover:text-foreground"><Minus size={16} /></button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-foreground-muted hover:text-foreground"><Plus size={16} /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-border bg-background-surface p-6 shadow-sm">
            <h2 className="mb-6 font-display text-lg font-bold text-foreground">Resumo</h2>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-foreground-muted"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-foreground-muted"><span>Taxa de Entrega</span><span>A calcular</span></div>
              <div className="h-px w-full bg-border" />
              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>Total Estimado</span>
                <span className="text-primary">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded-xl bg-primary py-4 text-center font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
            >
              Finalizar Compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}