"use client";

import KitchenTicket from "./KitchenTicket";

interface ItemPedido {
  id: string;
  quantity: number;
  product: {
    name: string;
  };
}

interface Pedido {
  id: string;
  status: string;
  createdAt: string | Date;
  items: ItemPedido[];
}

interface OrderKanbanColumnProps {
  title: string;
  status: string;
  pedidos: Pedido[];
  onAvancarStatus: (id: string, statusAtual: string) => void;
}

export default function OrderKanbanColumn({ title, status, pedidos, onAvancarStatus }: OrderKanbanColumnProps) {
  // Define a cor da bordinha superior e do contador baseado na coluna
  const obterCorTopo = (statusAtual: string) => {
    switch (statusAtual) {
      case 'PENDENTE':
        return 'border-t-yellow-500 bg-yellow-50 text-yellow-700';
      case 'PREPARANDO':
        return 'border-t-blue-500 bg-blue-50 text-blue-700';
      case 'PRONTO':
        return 'border-t-green-500 bg-green-50 text-green-700';
      default:
        return 'border-t-zinc-400 bg-zinc-50 text-zinc-600';
    }
  };

  const corClasse = obterCorTopo(status);

  return (
    <div className="flex-1 min-w-[300px] bg-zinc-100/80 rounded-2xl p-4 border border-zinc-200 flex flex-col h-[calc(100vh-180px)]">
      
      {/* Cabeçalho da Coluna */}
      <div className={`flex justify-between items-center p-3 rounded-xl border-t-4 shadow-sm mb-4 ${corClasse}`}>
        <h3 className="font-black uppercase tracking-wider text-xs">{title}</h3>
        <span className="font-bold text-sm bg-white px-2 py-0.5 rounded-full shadow-sm border border-zinc-200">
          {pedidos.length}
        </span>
      </div>

      {/* Lista de Tickets de Comanda rolável dentro da coluna */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {pedidos.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-zinc-400 text-sm font-medium p-4 text-center">
            Nenhum pedido nesta etapa
          </div>
        ) : (
          pedidos.map((pedido) => (
            <KitchenTicket 
              key={pedido.id} 
              pedido={pedido} 
              onAvancarStatus={onAvancarStatus} 
            />
          ))
        )}
      </div>
    </div>
  );
}