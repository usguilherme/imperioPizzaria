"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  code: string;
  customerName: string;
  items: any[];
  total: number;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    // Adicionado cache: 'no-store' para garantir dados atualizados
    const res = await fetch("/api/orders/pending", { cache: "no-store" });
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePrint = (order: Order) => {
    // 1. Abre a janela de impressão
    window.print();

    // 2. Aguarda 2 segundos antes de marcar no banco, evitando sumir antes da hora[cite: 1]
    setTimeout(() => {
      fetch(`/api/orders/mark-printed/${order.id}`, { method: "POST" }).then(() => {
        fetchOrders();
      });
    }, 2000); 
  };

  return (
    <div className="p-4">
      {/* Botão de Voltar adicionado[cite: 1] */}
      <Link href="/admin" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
        ← Voltar para o Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">Cozinha - Pedidos Pendentes</h1>
      <div className="grid gap-4">
        {orders.length === 0 && <p>Nenhum pedido pendente encontrado.</p>}
        {orders.map((order) => (
          <div key={order.id} className="border p-4 rounded bg-white shadow-sm">
            
            {/* ID único para cada cupom[cite: 1] */}
            <div id={`cupom-termico-${order.id}`} className="ticket-container">
              <h1 className="ticket-title">IMPÉRIO BURGUER</h1>
              <p className="ticket-subtitle">Pedido #{order.code}</p>
              <div className="ticket-divider" />
              
              <div className="ticket-line">Cliente: {order.customerName}</div>
              <div className="ticket-divider" />
              
              {order.items.map((item: any) => (
                <div key={item.id} className="ticket-item">
                  <p className="ticket-item-qty">{item.quantity}x {item.product?.title || item.name}</p>
                </div>
              ))}
              
              <div className="ticket-divider" />
              <p className="ticket-total">TOTAL: {formatCurrency(order.total)}</p>
            </div>
            
            <button 
              onClick={() => handlePrint(order)}
              className="mt-4 bg-primary text-white px-4 py-2 rounded print:hidden"
            >
              Imprimir Cupom
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}