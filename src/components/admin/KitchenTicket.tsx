"use client";

interface ItemPedido {
  id: string;
  quantity: number;
  product: {
    name: string;
  };
}

interface PedidoCozinhaProps {
  pedido: {
    id: string;
    status: string;
    createdAt: string | Date;
    items: ItemPedido[];
  };
  onAvancarStatus: (id: string, statusAtual: string) => void;
}

export default function KitchenTicket({ pedido, onAvancarStatus }: PedidoCozinhaProps) {
  // Formata o horário do pedido para o pizzaiolo saber quanto tempo faz que chegou
  const horario = new Date(pedido.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Define cores e textos baseado no status atual do Kanban da cozinha
  const obterConfigStatus = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return { botaoTexto: 'Preparar ➔', classeBotao: 'bg-yellow-600 hover:bg-yellow-700 text-white' };
      case 'PREPARANDO':
        return { botaoTexto: 'Pronto para Entrega ➔', classeBotao: 'bg-blue-600 hover:bg-blue-700 text-white' };
      default:
        return { botaoTexto: 'Concluir', classeBotao: 'bg-zinc-600 hover:bg-zinc-700 text-white' };
    }
  };

  const config = obterConfigStatus(pedido.status);

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 shadow-md flex flex-col justify-between min-h-[220px] text-zinc-800 font-mono">
      {/* Cabeçalho do Ticket - Estilo Comanda de Papel */}
      <div className="border-b-2 border-dashed border-amber-300 pb-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="font-black text-lg"># {pedido.id.slice(-4).toUpperCase()}</span>
          <span className="text-sm font-bold bg-amber-200 px-2 py-0.5 rounded text-amber-900">
            {horario}
          </span>
        </div>
      </div>

      {/* Itens do Pedido (O que o pizzaiolo deve fazer) */}
      <ul className="flex-1 space-y-3">
        {pedido.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-base font-bold">
            <span className="bg-zinc-900 text-white px-1.5 py-0.5 rounded text-sm min-w-[24px] text-center">
              {item.quantity}x
            </span>
            <span className="uppercase tracking-tight mt-0.5">{item.product.name}</span>
          </li>
        ))}
      </ul>

      {/* Botão de Ação para mudar de coluna no Kanban */}
      <div className="mt-4 pt-2 border-t border-amber-200">
        <button
          onClick={() => onAvancarStatus(pedido.id, pedido.status)}
          className={`w-full py-2.5 px-4 rounded-lg font-black text-xs uppercase tracking-wider transition shadow-sm ${config.classeBotao}`}
        >
          {config.botaoTexto}
        </button>
      </div>
    </div>
  );
}