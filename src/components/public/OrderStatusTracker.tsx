"use client";

import { useEffect, useRef, useState } from "react";
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

// Intervalo entre consultas. 1min30s ainda parece "automático" pro cliente,
// mas gera bem menos consultas comparado a 15s — reduz bastante o consumo do banco.
const POLL_INTERVAL_MS = 90000;

// Depois desse tempo com a aba aberta, para de consultar automaticamente
// (evita gastar banco à toa se o cliente esquecer a aba aberta o dia todo).
const MAX_POLLING_DURATION_MS = 30 * 60 * 1000; // 30 minutos

// Toca um som curto e vibra o aparelho (se suportado) para avisar o cliente
// que o status do pedido mudou, sem precisar ele ficar olhando a tela.
function notifyStatusChange() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(200);
    }
  } catch {
    // ignora — vibração é só um extra, não pode quebrar a página
  }

  try {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => {
      // navegador pode bloquear autoplay sem interação do usuário
    });
  } catch {
    // ignora — som é só um extra, não pode quebrar a página
  }
}

export function OrderStatusTracker({ code, initialStatus }: OrderStatusTrackerProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const previousStatusRef = useRef<OrderStatus>(initialStatus);
  const startTimeRef = useRef<number>(Date.now());
  const [stoppedByTimeout, setStoppedByTimeout] = useState(false);

  useEffect(() => {
    // Se já foi entregue, cancelado, ou já passou do tempo máximo, não consulta mais
    if (status === "DELIVERED" || status === "CANCELED" || stoppedByTimeout) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    async function fetchStatus() {
      // Se a aba não está visível (usuário trocou de aba/minimizou), pula essa consulta.
      // Isso sozinho já corta boa parte do consumo, já que muita gente deixa a aba
      // aberta em segundo plano depois de conferir o pedido.
      if (typeof document !== "undefined" && document.hidden) return;

      // Corta o polling depois do tempo máximo, mesmo que a aba continue aberta
      if (Date.now() - startTimeRef.current > MAX_POLLING_DURATION_MS) {
        setStoppedByTimeout(true);
        return;
      }

      try {
        const res = await fetch(`/api/orders/track/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();

        if (data.status !== previousStatusRef.current) {
          notifyStatusChange();
          previousStatusRef.current = data.status;
        }

        setStatus(data.status);
      } catch {
        // falha de rede silenciosa, tenta de novo no próximo ciclo
      }
    }

    interval = setInterval(fetchStatus, POLL_INTERVAL_MS);

    // Quando a aba volta a ficar visível, consulta na hora em vez de esperar
    // o próximo ciclo — assim o cliente vê o status atualizado imediatamente
    // ao voltar pra aba, sem precisar aumentar a frequência do polling em si.
    function handleVisibilityChange() {
      if (!document.hidden) fetchStatus();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [code, status, stoppedByTimeout]);

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

      {currentIndex >= 0 && currentIndex < STEPS.length - 1 && !stoppedByTimeout && (
        <p className="mt-6 text-center text-sm text-foreground-muted">
          Atualizamos essa página automaticamente — não precisa recarregar.
        </p>
      )}

      {stoppedByTimeout && (
        <p className="mt-6 text-center text-sm text-foreground-muted">
          Recarregue a página para ver a atualização mais recente do seu pedido.
        </p>
      )}
    </div>
  );
}