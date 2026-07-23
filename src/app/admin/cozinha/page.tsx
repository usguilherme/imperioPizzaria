"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  items: any[];
  total: number;
}

// 🚀 Aumentamos para 20 segundos para economizar brutalmente o Network Transfer da Vercel
const POLL_INTERVAL_MS = 20000;

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/pending", { cache: "no-store" });
      if (!res.ok) return;
      
      const data: Order[] = await res.json();

      const currentIds = new Set(data.map((o) => o.id));
      const previousIds = knownIdsRef.current;

      const freshIds = data
        .map((o) => o.id)
        .filter((id) => !previousIds.has(id));

      if (!isFirstFetchRef.current && freshIds.length > 0) {
        setNewOrderIds(new Set(freshIds));
        playNotificationSound();

        setTimeout(() => {
          setNewOrderIds((prev) => {
            const updated = new Set(prev);
            freshIds.forEach((id) => updated.delete(id));
            return updated;
          });
        }, 10000);
      }

      knownIdsRef.current = currentIds;
      isFirstFetchRef.current = false;
      setOrders(data);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  const playNotificationSound = () => {
    if (!soundUnlocked || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    const unlock = () => {
      setSoundUnlocked(true);
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // 🚀 OTIMIZAÇÃO MAXIMA: Polling Inteligente que PAUSA se a aba estiver minimizada
  useEffect(() => {
    fetchOrders(); // Busca inicial

    let interval: NodeJS.Timeout;

    const startPolling = () => {
      interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (interval) clearInterval(interval);
    };

    startPolling();

    // Se o usuário minimizar o Chrome ou mudar de aba, o polling para de consumir a Vercel
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchOrders(); // Atualiza na mesma hora que ele volta pra tela
        startPolling();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handlePrint = (order: Order) => {
    window.print();
    setTimeout(() => {
      fetch(`/api/orders/mark-printed/${order.id}`, { method: "POST" }).then(() => {
        fetchOrders();
      });
    }, 2000); 
  };

  return (
    <div className="p-4">
      <audio ref={audioRef} src="/sounds/new-order.mp3" preload="auto" />

      <Link href="/admin" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
        ← Voltar para o Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cozinha - Pedidos Pendentes</h1>
        {!soundUnlocked && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            Clique em qualquer lugar da tela para ativar o alerta sonoro
          </span>
        )}
      </div>

      <div className="grid gap-4">
        {orders.length === 0 && <p>Nenhum pedido pendente encontrado.</p>}
        {orders.map((order) => {
          const isNew = newOrderIds.has(order.id);
          return (
            <div
              key={order.id}
              className={`border p-4 rounded bg-white shadow-sm transition-all ${
                isNew ? "border-primary border-2 ring-2 ring-primary/30 animate-pulse" : ""
              }`}
            >
              {isNew && (
                <span className="inline-block mb-2 text-xs font-bold text-white bg-primary px-2 py-1 rounded print:hidden">
                  🔔 NOVO PEDIDO
                </span>
              )}

              <div id={`cupom-termico-${order.id}`} className="ticket-container">
                <h1 className="ticket-title text-center font-bold text-xl">IMPÉRIO BURGUER</h1>
                <p className="ticket-subtitle text-center text-sm">Pedido #{order.code}</p>
                <div className="ticket-divider border-t border-dashed border-black my-2" />

                <div className="ticket-line"><strong>Cliente:</strong> {order.customerName}</div>
                <div className="ticket-line"><strong>Fone:</strong> {order.customerPhone || "Não informado"}</div>
                <div className="ticket-line"><strong>Endereço:</strong> {order.deliveryAddress || "Retirada / Não informado"}</div>
                <div className="ticket-line"><strong>Pagamento:</strong> {order.paymentMethod || "Não informado"}</div>

                <div className="ticket-divider border-t border-dashed border-black my-2" />

                {order.items.map((item: any) => (
                  <div key={item.id} className="ticket-item mb-3">
                    <p className="ticket-item-qty font-bold text-base">
                      {item.quantity}x {item.product?.title || item.name}
                    </p>

                    <div className="pl-3 text-sm">
                      {(item.sizeName || item.size?.name) && <p>- Tamanho: {item.sizeName || item.size?.name}</p>}
                      {(item.crustName || item.crust?.name) && <p>- Borda: {item.crustName || item.crust?.name}</p>}
                      {item.flavors && item.flavors.length > 0 && (
                        <p>- Sabores: {item.flavors.map((f: any) => f.name || f.title || "Sabor").join(", ")}</p>
                      )}
                      {item.addons && item.addons.length > 0 && (
                        <div className="mt-1">
                          <p className="font-semibold">Adicionais:</p>
                          {item.addons.map((addon: any, idx: number) => (
                            <p key={idx} className="pl-2">+ {addon.quantity || 1}x {addon.name || addon.addon?.name}</p>
                          ))}
                        </div>
                      )}
                      {(item.observations || item.observation) && (
                        <p className="mt-1 font-semibold uppercase">Obs: {item.observations || item.observation}</p>
                      )}
                    </div>
                  </div>
                ))}

                {order.notes && (
                  <div className="mt-2 border-t border-dashed border-black pt-1">
                    <p className="font-bold text-sm">DESCRIÇÃO / OBS GERAL:</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}

                <div className="ticket-divider border-t border-dashed border-black my-2" />
                <p className="ticket-total text-right font-bold text-lg">TOTAL: {formatCurrency(order.total)}</p>
              </div>

              <button
                onClick={() => handlePrint(order)}
                className="mt-4 bg-primary text-white px-4 py-2 rounded print:hidden"
              >
                Imprimir Cupom
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}