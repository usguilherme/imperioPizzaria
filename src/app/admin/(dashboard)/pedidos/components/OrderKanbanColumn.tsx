"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { updateOrderStatusAction, deleteOrderAction } from "@/actions/order.actions";
import { Trash2, MessageCircle, X } from "lucide-react";

export interface KanbanOrder {
  id: string;
  code: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
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
  status,
  orders,
  nextStatus,
  nextLabel,
  accentColor,
}: OrderKanbanColumnProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedOrder, setSelectedOrder] = useState<KanbanOrder | null>(null);

  const handleAdvance = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (!nextStatus) return;
    startTransition(() => { updateOrderStatusAction(orderId, nextStatus); });
  };

  const handleDelete = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;
    startTransition(() => { deleteOrderAction(orderId); });
  };

  const getWhatsAppLink = (order: KanbanOrder) => {
    const cleanPhone = order.customerPhone!.replace(/\D/g, "");
    const finalPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    
    // LÓGICA INTELIGENTE: Muda a mensagem baseada no status da coluna
    const message = status === OrderStatus.OUT_FOR_DELIVERY 
      ? `Olá, ${order.customerName}! Seu pedido #${order.code} saiu para entrega e está a caminho! 🛵`
      : `Olá, ${order.customerName}! Seu pedido #${order.code} está pronto! 🍔`;

    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  };

  const columnTotal = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <>
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
              onClick={() => setSelectedOrder(order)}
              className="cursor-pointer rounded-lg border border-border bg-background-elevated p-3 transition-opacity hover:border-primary"
              style={{ opacity: isPending ? 0.6 : 1 }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-accent">{order.code}</span>
                <span className="text-[11px] text-foreground-subtle">{formatDateTime(order.createdAt)}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{order.customerName}</p>
              <p className="mb-2 text-xs text-foreground-muted">
                {order.itemsCount} {order.itemsCount === 1 ? "item" : "itens"} · {formatCurrency(order.total)}
              </p>

              <div className="flex gap-2">
                {nextStatus && (
                  <button
                    onClick={(e) => handleAdvance(e, order.id)}
                    className="flex-1 rounded-md bg-primary/15 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25"
                  >
                    {nextLabel}
                  </button>
                )}
                
                {order.customerPhone && (
                  <a
                    href={getWhatsAppLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center rounded-md bg-green-500/10 px-2 py-1.5 text-green-500 hover:bg-green-500/20"
                  >
                    <MessageCircle size={16} />
                  </a>
                )}

                <button
                  onClick={(e) => handleDelete(e, order.id)}
                  className="flex items-center justify-center rounded-md bg-red-500/10 px-2 py-1.5 text-red-500 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-md rounded-lg bg-background-surface border border-border p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Pedido {selectedOrder.code}</h2>
              <button onClick={() => setSelectedOrder(null)}><X size={20}/></button>
            </div>
            <div className="space-y-3 text-sm">
              <p><strong>Cliente:</strong> {selectedOrder.customerName}</p>
              <p><strong>Telefone:</strong> {selectedOrder.customerPhone || "N/A"}</p>
              <p><strong>Endereço:</strong> {selectedOrder.customerAddress || "Não informado"}</p>
              <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
              
              {selectedOrder.customerPhone && (
                <a
                  href={getWhatsAppLink(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-green-500/10 py-2 text-green-500 hover:bg-green-500/20"
                >
                  <MessageCircle size={16} /> Falar com cliente
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}