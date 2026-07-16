"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createOrderAction } from "@/actions/order.actions";

// Tabela de fretes por bairro
const DELIVERY_FEES: Record<string, number> = {
  "Centro": 3.00,
  "Pintado": 7.00,
  "Sitio": 15.00,
  "Bela Vista": 5.00,
};

// Detecção de iOS (Safari bloqueia window.open após um await)
function isIOSDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  // Puxando a função getTotalPrice que sabe somar os adicionais perfeitamente
  const { items, clearCart, getTotalPrice } = useCartStore();

  const [bairro, setBairro] = useState<string>("Centro");
  const deliveryFee = DELIVERY_FEES[bairro] ?? 0;

  // O subtotal agora é calculado pelo store (cérebro) do carrinho
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryFee;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // --- Estados para o fluxo iOS/Desktop ---
  const [isIOS, setIsIOS] = useState(false);
  const [showWhatsappCard, setShowWhatsappCard] = useState(false);
  const [iosWhatsappUrl, setIosWhatsappUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    setIsIOS(isIOSDevice());
  }, []);

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

    const lastOrderTime = localStorage.getItem("@imperio:lastOrderTime");
    if (lastOrderTime) {
      const timePassed = Date.now() - parseInt(lastOrderTime);
      const fiveMinutes = 5 * 60 * 1000;

      if (timePassed < fiveMinutes) {
        setError("Você acabou de fazer um pedido. Por favor, aguarde alguns minutos antes de fazer outro.");
        return;
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
          deliveryFee,
          neighborhood: bairro,
        },
        items
      );

      if (!result.success) {
        setError(result.error ?? "Erro ao finalizar pedido");
        return;
      }

      localStorage.setItem("@imperio:lastOrderTime", Date.now().toString());

      const paymentMap = {
        PIX: "Pix",
        CREDIT_CARD: "Cartão de Crédito",
        DEBIT_CARD: "Cartão de Débito",
        CASH: "Dinheiro",
      };

      let message = `*NOVO PEDIDO!* 🛵\n\n`;
      message += `*Cliente:* ${form.customerName}\n`;
      message += `*Telefone:* ${form.customerPhone}\n`;
      message += `*Bairro:* ${bairro}\n`;
      message += `*Endereço:* ${form.deliveryAddress}${form.addressComplement ? `, ${form.addressComplement}` : ''}\n`;
      message += `*Pagamento:* ${paymentMap[form.paymentMethod]}\n\n`;

      message += `*PEDIDO:*\n`;
      items.forEach((item) => {
        // Cálculo do valor do item no wpp considerando os adicionais
        const addonsPrice = item.selectedAddons?.reduce((acc, a) => acc + Number(a.price), 0) || 0;
        const finalItemPrice = (Number(item.price) + addonsPrice) * item.quantity;

        message += `• ${item.quantity}x ${item.name} - ${formatCurrency(finalItemPrice)}\n`;

        if (item.flavors && item.flavors.length > 0) {
          message += `   Sabores: ${item.flavors.map(f => f.name).join(" e ")}\n`;
        }

        if (item.selectedAddons && item.selectedAddons.length > 0) {
          message += `   Adicionais: ${item.selectedAddons.map(a => a.name).join(", ")}\n`;
        }
      });

      message += `\n*Subtotal:* ${formatCurrency(subtotal)}\n`;
      message += `*Taxa de entrega:* ${formatCurrency(deliveryFee)}\n`;
      message += `*TOTAL:* ${formatCurrency(total)}\n`;

      if (form.notes) {
        message += `\n*Observações:* ${form.notes}`;
      }

      // Detecta se é computador para forçar o WhatsApp Web
      const isDesktopUser = !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

      const whatsappUrl = isDesktopUser
        ? `https://web.whatsapp.com/send?phone=5583988738301&text=${encodeURIComponent(message)}`
        : `https://api.whatsapp.com/send?phone=5583988738301&text=${encodeURIComponent(message)}`;

      if (isIOS || isDesktopUser) {
        // iOS ou Desktop: Exibe o card para evitar o bloqueador de pop-ups agressivo do navegador.
        setIosWhatsappUrl(whatsappUrl);
        setOrderCode(result.code ?? null);
        clearCart();
        setShowWhatsappCard(true);
      } else {
        // Android: Abre direto
        window.open(whatsappUrl, "_blank");
        clearCart();
        router.push(`/pedido-confirmado?code=${result.code ?? ""}`);
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Checkout</h1>

      {/* Card verde exibido no iOS ou no Computador após o pedido ser salvo */}
      {showWhatsappCard && iosWhatsappUrl ? (
        <div className="rounded-xl bg-green-600 text-white p-6 text-center shadow-lg space-y-4">
          <p className="font-semibold text-lg">
            Pedido salvo com sucesso! Agora finalize enviando no WhatsApp:
          </p>

          <a
            href={iosWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // Clique manual do usuário: navegação permitida.
              router.push(`/pedido-confirmado?code=${orderCode}`);
            }}
            className="inline-block bg-white text-green-700 font-bold py-3 px-6 rounded-lg"
          >
            ENVIAR PEDIDO NO WHATSAPP
          </a>

          {orderCode && (
            <div className="pt-2">
              <a
                href={`/pedido/${orderCode}`}
                className="inline-block text-sm font-medium text-white/90 underline underline-offset-2 hover:text-white"
              >
                Acompanhar meu pedido →
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Resumo visual do pedido */}
          {items.length > 0 && (
            <div className="mb-6 space-y-3 rounded-lg border border-border bg-background-surface p-4">
              <h2 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Resumo do Pedido</h2>

              <div className="space-y-3 divide-y divide-border/50">
                {items.map((item, idx) => {
                  const addonsPrice = item.selectedAddons?.reduce((acc, a) => acc + Number(a.price), 0) || 0;
                  const itemTotal = (Number(item.price) + addonsPrice) * item.quantity;

                  return (
                    <div key={item.id || idx} className="pt-3 first:pt-0">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-foreground">{formatCurrency(itemTotal)}</span>
                      </div>

                      {item.flavors && item.flavors.length > 0 && (
                        <p className="text-xs text-foreground-muted mt-1">
                          Pizza: {item.flavors.map(f => f.name).join(" e ")}
                        </p>
                      )}

                      {/* Listagem visual dos adicionais */}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {item.selectedAddons.map((addon, i) => (
                            <span key={i} className="text-xs text-foreground-muted">
                              + {addon.name} ({formatCurrency(Number(addon.price))})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-900/20 border border-red-900/40 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <input required placeholder="Nome completo" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none" />
            <input required placeholder="Telefone / WhatsApp" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none" />

            {/* Seletor de Bairro */}
            <select value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none">
              {Object.keys(DELIVERY_FEES).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <input required placeholder="Endereço de entrega" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none" />
            <input placeholder="Complemento (opcional)" value={form.addressComplement} onChange={(e) => setForm({ ...form, addressComplement: e.target.value })} className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none" />

            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as typeof form.paymentMethod })} className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none">
              <option value="PIX">Pix</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="DEBIT_CARD">Cartão de Débito</option>
              <option value="CASH">Dinheiro</option>
            </select>

            <textarea placeholder="Observações do pedido (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none" />

            <div className="space-y-1 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-foreground-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground-muted">
                <span>Taxa de entrega ({bairro})</span>
                <span>{formatCurrency(deliveryFee)}</span>
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
        </>
      )}
    </div>
  );
}