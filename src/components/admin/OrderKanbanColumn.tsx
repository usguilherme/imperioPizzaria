"use client";

import { OrderStatus } from "@prisma/client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { updateOrderStatusAction, deleteOrderAction } from "@/actions/order.actions";
import { useTransition } from "react";
import { Trash2, MessageCircle } from "lucide-react"; // Ícone importado

export interface KanbanOrder {
  id: string;
  code: string;
  customerName: string;
  customerPhone?: string; // Telefone opcional[cite: 5]
  status: OrderStatus;
  total: number;
  createdAt: string;
  itemsCount: number;
}

interface OrderKanbanColumnProps {
  title: string;
  status: OrderStatus;
  orders: KanbanOrder[];
  nextStatus?: OrderStatus;
  nextLabel?: string;
  accentColor: string;
}

export function OrderKanbanColumn({
  title,
  orders,
  nextStatus,
  nextLabel,
  accentColor,
}: OrderKanbanColumnProps) {
  const [isPending, startTransition] = useTransition();

  const handleAdvance = (orderId: string) => {
    if (!nextStatus) return;
    startTransition(() => {
      updateOrderStatusAction(orderId, nextStatus);
    });
  };

  const handleDelete = (orderId: string) => {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;
    startTransition(() => {
      deleteOrderAction(orderId);
    });
  };

  const columnTotal = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-card bg-background-surface border border-border">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accentColor}`} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="rounded-full bg-background-elevated px-2 py-0.5 text-xs text-foreground-muted">
            {orders.length}
          </span>
        </div>
      </div>

      <div className="border-b border-border px-3 py-2">
        <span className="text-xs text-foreground-subtle">Total: </span>
        <span className="text-sm font-bold text-primary">{formatCurrency(columnTotal)}</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-border bg-background-elevated p-3 transition-opacity"
            style={{ opacity: isPending ? 0.6 : 1 }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-accent">{order.code}</span>
              <span className="text-[11px] text-foreground-subtle">
                {formatDateTime(order.createdAt)}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">{order.customerName}</p>
            <p className="mb-2 text-xs text-foreground-muted">
              {order.itemsCount} {order.itemsCount === 1 ? "item" : "itens"} ·{" "}
              {formatCurrency(order.total)}
            </p>

            <div className="flex gap-2">
              {nextStatus && (
                <button
                  onClick={() => handleAdvance(order.id)}
                  disabled={isPending}
                  className="flex-1 rounded-md bg-primary/15 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/25 disabled:opacity-50"
                >
                  {nextLabel}
                </button>
              )}
              
              {/* Botão de WhatsApp usando comparação com Enum OrderStatus[cite: 5] */}
              {order.status === OrderStatus.READY && order.customerPhone && (
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=Olá, ${order.customerName}! Seu pedido #${order.code} está pronto.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-md bg-green-500/10 px-2 py-1.5 text-green-500 transition-colors hover:bg-green-500/20"
                >
                  <MessageCircle size={16} />
                </a>
              )}
              
              <button
                onClick={() => handleDelete(order.id)}
                disabled={isPending}
                className="flex items-center justify-center rounded-md bg-red-500/10 px-2 py-1.5 text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="py-6 text-center text-xs text-foreground-subtle">Nenhum pedido</p>
        )}
      </div>
    </div>
  );
}