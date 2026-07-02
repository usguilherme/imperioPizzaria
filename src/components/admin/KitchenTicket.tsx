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
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: string;
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
      <h1 className="ticket-title">IMPÉRIO</h1>
      <p className="ticket-subtitle">Hambúrgueria &amp; Pizzaria</p>
      <div className="ticket-divider" />

      <p className="ticket-line"><strong>Pedido:</strong> {order.code}</p>
      <p className="ticket-line"><strong>Cliente:</strong> {order.customerName}</p>
      <p className="ticket-line"><strong>Fone:</strong> {order.customerPhone}</p>
      <p className="ticket-line"><strong>Endereço:</strong> {order.deliveryAddress}</p>
      <p className="ticket-line"><strong>Pagamento:</strong> {order.paymentMethod}</p>

      <div className="ticket-divider" />

      {order.items.map((item, idx) => (
        <div key={idx} className="ticket-item">
          <p className="ticket-item-qty">
            {item.quantity}x {item.productTitle}
          </p>
          {item.flavorOne && (
            <p className="ticket-item-detail">
              Sabor 1: {item.flavorOne}
              {item.flavorTwo && ` / Sabor 2: ${item.flavorTwo}`}
            </p>
          )}
          {item.observation && (
            <p className="ticket-item-obs">Obs: {item.observation}</p>
          )}
        </div>
      ))}

      <div className="ticket-divider" />

      {order.notes && <p className="ticket-line">Obs geral: {order.notes}</p>}

      <p className="ticket-total">TOTAL: {formatCurrency(order.total)}</p>
      <p className="ticket-footer">Obrigado pela preferência!</p>
    </div>
  );
}
