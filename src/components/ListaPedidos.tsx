"use client";

import { updateOrderStatusAction } from '@/actions/order.actions';
import { useState } from 'react';

export default function ListaPedidos({ initialPedidos }: { initialPedidos: any[] }) {
  const [pedidos, setPedidos] = useState(initialPedidos);

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatusAction(id, status);
    // Atualiza a lista na tela sem precisar recarregar a página
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status } : p));
  };

  return (
    <div className="space-y-4">
      {pedidos.map((pedido) => (
        <div key={pedido.id} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <span className="font-bold text-lg">Pedido: {pedido.id.slice(0, 8)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              pedido.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {pedido.status}
            </span>
          </div>

          {/* Exibição do Endereço */}
          <div className="mb-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Endereço de entrega:</p>
            <p className="text-sm font-medium text-zinc-800">{pedido.address || "Não informado"}</p>
          </div>
          
          <ul className="space-y-2 mb-4">
            {pedido.items.map((item: any) => (
              <li key={item.id} className="text-sm text-zinc-600">
                {item.quantity}x {item.product.name} - R$ {Number(item.price).toFixed(2)}
              </li>
            ))}
          </ul>
          
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-bold">Total: R$ {Number(pedido.total).toFixed(2)}</span>
            <div className="flex gap-2">
              {pedido.status === 'PENDENTE' && (
                <button 
                  onClick={() => handleStatusChange(pedido.id, 'CONCLUÍDO')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                >
                  Concluir
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}