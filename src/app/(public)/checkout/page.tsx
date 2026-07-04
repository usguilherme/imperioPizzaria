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

    // ==========================================
    // 1. TRAVA ANTI-SPAM (COOLDOWN DE 5 MINUTOS)
    // ==========================================
    const lastOrderTime = localStorage.getItem("@imperio:lastOrderTime");
    if (lastOrderTime) {
      const timePassed = Date.now() - parseInt(lastOrderTime);
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timePassed < fiveMinutes) {
        setError("Você acabou de fazer um pedido. Por favor, aguarde alguns minutos antes de fazer outro.");
        return; // Impede a continuação da função
      }
    }

    if (items.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction(
        {
          ...form,
          deliveryFee: DELIVERY_FEE,
        },
        items 
      );

      if (!result.success) {
        setError(result.error ?? "Erro ao finalizar pedido");
        return;
      }

      // ==========================================
      // 2. REGISTRA O HORÁRIO DO SUCESSO NO NAVEGADOR
      // ==========================================
      localStorage.setItem("@imperio:lastOrderTime", Date.now().toString());

      // ==========================================
      // LÓGICA DE MENSAGEM PARA O WHATSAPP
      // ==========================================
      const paymentMap = {
        PIX: "Pix",
        CREDIT_CARD: "Cartão de Crédito",
        DEBIT_CARD: "Cartão de Débito",
        CASH: "Dinheiro",
      };

      let message = `*NOVO PEDIDO!* 🛵\n\n`;
      message += `*Cliente:* ${form.customerName}\n`;
      message += `*Telefone:* ${form.customerPhone}\n`;
      message += `*Endereço:* ${form.deliveryAddress}${form.addressComplement ? `, ${form.addressComplement}` : ''}\n`;
      message += `*Pagamento:* ${paymentMap[form.paymentMethod]}\n\n`;

      message += `*PEDIDO:*\n`;
      items.forEach((item) => {
        message += `• ${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}\n`;
        
        if (item.flavors && item.flavors.length > 0) {
          message += `   Sabores: ${item.flavors.map(f => f.name).join(" e ")}\n`;
        }
        
        if (item.selectedAddons && item.selectedAddons.length > 0) {
          message += `   Adicionais: ${item.selectedAddons.map(a => a.name).join(", ")}\n`;
        }
      });

      message += `\n*Subtotal:* ${formatCurrency(subtotal)}\n`;
      message += `*Taxa de entrega:* ${formatCurrency(DELIVERY_FEE)}\n`;
      message += `*TOTAL:* ${formatCurrency(total)}\n`;

      if (form.notes) {
        message += `\n*Observações:* ${form.notes}`;
      }

      const targetPhone = "5583988738301";
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');

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