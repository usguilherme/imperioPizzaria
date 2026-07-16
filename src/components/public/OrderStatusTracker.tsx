"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

interface OrderStatusTrackerProps {
  code: string;
  initialStatus: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Recebido" },
  { status: "CONFIRMED", label: "Confirmado" },
  { status: "IN_PREPARATION", label: "Em preparo" },
  { status: "READY", label: "Pronto" },
  { status: "OUT_FOR_DELIVERY", label: "Saiu para entrega" },
  { status: "DELIVERED", label: "Entregue" },
];

const POLL_INTERVAL_MS = 15000; // 15 segundos — página de cliente, pode ser mais ágil que o admin

export function OrderStatusTracker({ code, initialStatus }: OrderStatusTrackerProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    // Se já foi entregue ou cancelado, não precisa mais ficar consultando
    if (status === "DELIVERED" || status === "CANCELED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/track/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data.status);
      } catch {
        // falha de rede silenciosa, tenta de novo no próximo ciclo
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [code, status]);

  if (status === "CANCELED") {
    return (
      <div className="flex items-center gap-3 rounded-card border border-red-500/30 bg-red-500/10 p-4">
        <XCircle className="text-red-500" size={24} />
        <div>
          <p className="font-semibold text-red-500">Pedido cancelado</p>
          <p className="text-sm text-foreground-muted">
            Entre em contato conosco se tiver dúvidas sobre esse pedido.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="rounded-card border border-border bg-background-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {STEPS.map((step, index) => {
          const isComplete = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex flex-1 items-center gap-3 sm:flex-col sm:text-center">
              <div className="flex items-center sm:flex-col">
                {isComplete ? (
                  <CheckCircle2
                    className={isCurrent ? "text-primary animate-pulse" : "text-primary"}
                    size={28}
                  />
                ) : (
                  <Circle className="text-foreground-subtle" size={28} />
                )}
              </div>
              <p
                className={`text-sm font-medium ${
                  isComplete ? "text-foreground" : "text-foreground-subtle"
                }`}
              >
                {step.label}
              </p>
              {index < STEPS.length - 1 && (
                <div
                  className={`hidden h-0.5 flex-1 sm:block ${
                    index < currentIndex ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {currentIndex >= 0 && currentIndex < STEPS.length - 1 && (
        <p className="mt-6 text-center text-sm text-foreground-muted">
          Atualizamos essa página automaticamente — não precisa recarregar.
        </p>
      )}
    </div>
  );
}