"use client";

import { useEffect, useState } from "react";

export default function TodayOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/orders/today")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pedidos de Hoje</h1>
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <p>Nenhum pedido recebido hoje ainda.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="p-4 border rounded-lg bg-background-surface">
              <p className="font-bold">Cliente: {order.customerName}</p>
              <p>Total: R$ {order.totalAmount}</p>
              <p className="text-sm text-muted">Horário: {new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}