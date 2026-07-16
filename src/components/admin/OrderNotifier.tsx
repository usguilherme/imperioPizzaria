"use client";

import { useNewOrderNotifier } from "@/hooks/useNewOrderNotifier";

export function OrderNotifier() {
  const { pendingCount, hasNewOrder, soundUnlocked, audioRef } = useNewOrderNotifier();

  return (
    <>
      <audio ref={audioRef} src="/sounds/new-order.mp3" preload="auto" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {pendingCount > 0 && (
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
              hasNewOrder
                ? "bg-primary text-white animate-pulse"
                : "bg-primary/10 text-primary"
            }`}
          >
            🔔 {pendingCount} pedido{pendingCount > 1 ? "s" : ""} pendente{pendingCount > 1 ? "s" : ""}
          </span>
        )}

        {!soundUnlocked && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            Clique em qualquer lugar da tela para ativar o alerta sonoro
          </span>
        )}
      </div>
    </>
  );
}