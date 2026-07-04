"use client";

import { useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

interface KitchenTicketItem {
  quantity: number;
  productTitle: string;
  observation?: string | null;
  flavorOne?: string;
  flavorTwo?: string | null;
}

interface KitchenTicketProps {
  order: {
    code: string;
    customerName: string;
    customerPhone?: string | null;
    deliveryAddress?: string | null;
    paymentMethod?: string | null;
    createdAt: string;
    items: KitchenTicketItem[];
    total: number;
    notes?: string | null;
  };
  autoPrint?: boolean;
}

export function KitchenTicket({ order, autoPrint = true }: KitchenTicketProps) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return (
    <div className="ticket-container">
      <h1 className="ticket-title text-center font-bold text-xl">IMPÉRIO</h1>
      <p className="ticket-subtitle text-center text-sm">Hambúrgueria & Pizzaria</p>
      <div className="ticket-divider border-t border-dashed border-black my-2" />

      <p className="ticket-line"><strong>Pedido:</strong> {order.code}</p>
      <div className="ticket-divider border-t border-dashed border-black my-2" />
      
      <p className="ticket-line"><strong>Cliente:</strong> {order.customerName}</p>
      <p className="ticket-line"><strong>Fone:</strong> {order.customerPhone || "Não informado"}</p>
      <p className="ticket-line"><strong>Endereço:</strong> {order.deliveryAddress || "Retirada / Não informado"}</p>
      <p className="ticket-line"><strong>Pagamento:</strong> {order.paymentMethod || "Não informado"}</p>

      <div className="ticket-divider border-t border-dashed border-black my-2" />

      {order.items.map((item, idx) => (
        <div key={idx} className="ticket-item mb-2">
          <p className="ticket-item-qty font-bold">
            {item.quantity}x {item.productTitle}
          </p>
          {item.flavorOne && (
            <p className="ticket-item-detail pl-2 text-sm">
              Sabor 1: {item.flavorOne}
              {item.flavorTwo && ` / Sabor 2: ${item.flavorTwo}`}
            </p>
          )}
          {item.observation && (
            <p className="ticket-item-obs pl-2 text-sm italic">Obs: {item.observation}</p>
          )}
        </div>
      ))}

      <div className="ticket-divider border-t border-dashed border-black my-2" />

      {order.notes && (
        <>
          <p className="ticket-line mb-2"><strong>Obs geral:</strong> {order.notes}</p>
          <div className="ticket-divider border-t border-dashed border-black my-2" />
        </>
      )}

      <p className="ticket-total text-right font-bold text-lg mt-2">TOTAL: {formatCurrency(order.total)}</p>
      <p className="ticket-footer text-center mt-4 text-sm">Obrigado pela preferência!</p>
    </div>
  );
}