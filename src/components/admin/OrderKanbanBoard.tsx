"use client";

import { OrderStatus } from "@prisma/client";
import { OrderKanbanColumn, KanbanOrder } from "./OrderKanbanColumn";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";
import { formatCurrency } from "@/lib/utils";

interface OrderKanbanBoardProps {
  initialOrders: KanbanOrder[];
}

const COLUMNS: Array<{
  status: OrderStatus;
  title: string;
  nextStatus?: OrderStatus;
  nextLabel?: string;
  accentColor: string;
}> = [
  { status: "PENDING", title: "Pendente", nextStatus: "CONFIRMED", nextLabel: "Confirmar pagamento", accentColor: "bg-yellow-500" },
  { status: "CONFIRMED", title: "Confirmado", nextStatus: "IN_PREPARATION", nextLabel: "Iniciar preparo", accentColor: "bg-blue-500" },
  { status: "IN_PREPARATION", title: "Em Preparo", nextStatus: "READY", nextLabel: "Marcar como pronto", accentColor: "bg-orange-500" },
  { status: "READY", title: "Pronto", nextStatus: "OUT_FOR_DELIVERY", nextLabel: "Saiu para entrega", accentColor: "bg-purple-500" },
  { status: "OUT_FOR_DELIVERY", title: "Em Entrega", nextStatus: "DELIVERED", nextLabel: "Confirmar entrega", accentColor: "bg-primary" },
];

export function OrderKanbanBoard({ initialOrders }: OrderKanbanBoardProps) {
  // Polling a cada 10s — troque por WebSocket/Pusher se precisar de latência menor
  const { orders } = useOrderRealtime(initialOrders);

  const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Pedidos</h1>
        <div className="rounded-lg bg-background-surface border border-border px-4 py-2">
          <span className="text-xs text-foreground-subtle">Total em aberto: </span>
          <span className="text-lg font-bold text-primary">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <OrderKanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            nextStatus={col.nextStatus}
            nextLabel={col.nextLabel}
            accentColor={col.accentColor}
            orders={orders.filter((o) => o.status === col.status)}
          />
        ))}
      </div>
    </div>
  );
}
