"use client";

import { useEffect, useState } from "react";
import { KanbanOrder } from "@/components/admin/OrderKanbanColumn";

const POLL_INTERVAL_MS = 10_000;

/**
 * Polling simples via API route. Para latência menor, substitua por
 * WebSocket (Pusher/Ably) ou Server-Sent Events sem mudar a interface do hook.
 */
export function useOrderRealtime(initialOrders: KanbanOrder[]) {
  const [orders, setOrders] = useState<KanbanOrder[]>(initialOrders);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/orders/active", { cache: "no-store" });
        if (!res.ok) return;
        const data: KanbanOrder[] = await res.json();
        setOrders(data);
      } catch {
        // silencioso: mantém os dados atuais em caso de falha de rede pontual
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return { orders };
}
