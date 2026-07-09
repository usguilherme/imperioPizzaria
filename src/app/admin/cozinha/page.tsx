"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  paymentMethod?: string | null;
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

    // 2. Aguarda 2 segundos antes de marcar no banco, evitando sumir antes da hora
    setTimeout(() => {
      fetch(`/api/orders/mark-printed/${order.id}`, { method: "POST" }).then(() => {
        fetchOrders();
      });
    }, 2000); 
  };

  return (
    <div className="p-4">
      {/* Botão de Voltar adicionado */}
      <Link href="/admin" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
        ← Voltar para o Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">Cozinha - Pedidos Pendentes</h1>
      <div className="grid gap-4">
        {orders.length === 0 && <p>Nenhum pedido pendente encontrado.</p>}
        {orders.map((order) => (
          <div key={order.id} className="border p-4 rounded bg-white shadow-sm">
            
            {/* ID único para cada cupom */}
            <div id={`cupom-termico-${order.id}`} className="ticket-container">
              <h1 className="ticket-title text-center font-bold text-xl">IMPÉRIO BURGUER</h1>
              <p className="ticket-subtitle text-center text-sm">Pedido #{order.code}</p>
              <div className="ticket-divider border-t border-dashed border-black my-2" />
              
              <div className="ticket-line"><strong>Cliente:</strong> {order.customerName}</div>
              <div className="ticket-line"><strong>Fone:</strong> {order.customerPhone || "Não informado"}</div>
              <div className="ticket-line"><strong>Endereço:</strong> {order.deliveryAddress || "Retirada / Não informado"}</div>
              <div className="ticket-line"><strong>Pagamento:</strong> {order.paymentMethod || "Não informado"}</div>
              
              <div className="ticket-divider border-t border-dashed border-black my-2" />
              
              {/* LÓGICA DE ITENS ATUALIZADA AQUI */}
              {order.items.map((item: any) => (
                <div key={item.id} className="ticket-item mb-3">
                  <p className="ticket-item-qty font-bold text-base">
                    {item.quantity}x {item.product?.title || item.name}
                  </p>
                  
                  {/* Detalhes do produto - Fonte um pouco menor e com recuo */}
                  <div className="pl-3 text-sm">
                    
                    {/* Exibe o Tamanho, se tiver */}
                    {(item.sizeName || item.size?.name) && (
                      <p>- Tamanho: {item.sizeName || item.size?.name}</p>
                    )}

                    {/* Exibe a Borda, se tiver */}
                    {(item.crustName || item.crust?.name) && (
                      <p>- Borda: {item.crustName || item.crust?.name}</p>
                    )}

                    {/* Exibe múltiplos Sabores (AQUI ESTÁ A CORREÇÃO DO OBJECT) */}
                    {item.flavors && item.flavors.length > 0 && (
                      <p>- Sabores: {item.flavors.map((f: any) => f.name || f.title || f.product?.title || "Sabor não informado").join(", ")}</p>
                    )}

                    {/* Exibe Adicionais (como bacon extra, mais queijo) */}
                    {item.addons && item.addons.length > 0 && (
                      <div className="mt-1">
                        <p className="font-semibold">Adicionais:</p>
                        {item.addons.map((addon: any, idx: number) => (
                          <p key={idx} className="pl-2">
                            + {addon.quantity || 1}x {addon.name || addon.addon?.name}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Exibe Observações daquele item específico */}
                    {(item.observations || item.observation) && (
                      <p className="mt-1 font-semibold uppercase">
                        Obs: {item.observations || item.observation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {/* FIM DA LÓGICA DE ITENS */}
              
              <div className="ticket-divider border-t border-dashed border-black my-2" />
              <p className="ticket-total text-right font-bold text-lg">TOTAL: {formatCurrency(order.total)}</p>
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