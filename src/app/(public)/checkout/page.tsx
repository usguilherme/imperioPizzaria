"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createOrderAction } from "@/actions/order.actions";

const DELIVERY_FEE = 6.9;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  
  // Cálculo do subtotal atualizado para o formato numérico
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal + DELIVERY_FEE;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    addressComplement: "",
    paymentMethod: "PIX" as "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    startTransition(async () => {
      // Enviando para a action conforme a nova estrutura do carrinho
      const result = await createOrderAction(
        {
          ...form,
          deliveryFee: DELIVERY_FEE,
        },
        items // Passamos os itens direto, a action já sabe lidar com sizeId/flavors
      );

      if (!result.success) {
        setError(result.error ?? "Erro ao finalizar pedido");
        return;
      }

      clearCart();
      router.push(`/pedido-confirmado?code=${result.code}`);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-900/40 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <input
          required
          placeholder="Nome completo"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        />

        <input
          required
          placeholder="Telefone / WhatsApp"
          value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        />

        <input
          required
          placeholder="Endereço de entrega"
          value={form.deliveryAddress}
          onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        />

        <input
          placeholder="Complemento (opcional)"
          value={form.addressComplement}
          onChange={(e) => setForm({ ...form, addressComplement: e.target.value })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        />

        <select
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as typeof form.paymentMethod })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        >
          <option value="PIX">Pix</option>
          <option value="CREDIT_CARD">Cartão de Crédito</option>
          <option value="DEBIT_CARD">Cartão de Débito</option>
          <option value="CASH">Dinheiro</option>
        </select>

        <textarea
          placeholder="Observações do pedido (opcional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        />

        <div className="space-y-1 border-t border-border pt-4">
          <div className="flex justify-between text-sm text-foreground-muted">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-foreground-muted">
            <span>Taxa de entrega</span>
            <span>{formatCurrency(DELIVERY_FEE)}</span>
          </div>
          <div className="flex justify-between font-display text-lg font-bold text-primary">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Enviando pedido..." : "Confirmar pedido"}
        </Button>
      </form>
    </div>
  );
}