"use client";

import { useState } from "react";
import OrderKanbanColumn from "./OrderKanbanColumn";
// Importando a Server Action diretamente no topo para o TypeScript reconhecer o tipo sem erro
import { updateOrderStatusAction } from "@/actions/product.actions";

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

interface OrderKanbanBoardProps {
  pedidosIniciais: Pedido[];
}

export default function OrderKanbanBoard({ pedidosIniciais }: OrderKanbanBoardProps) {
  // Estado local para atualizar o Kanban na tela instantaneamente (Optimistic UI)
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais);

  // Função que gerencia a transição de colunas e atualiza o status
  const handleAvancarStatus = async (id: string, statusAtual: string) => {
    let proximoStatus = "";

    if (statusAtual === "PENDENTE") proximoStatus = "PREPARANDO";
    else if (statusAtual === "PREPARANDO") proximoStatus = "PRONTO";
    else return; // Se já estiver pronto, não avança mais por aqui

    // 1. Atualiza o estado na tela na mesma hora para o pizzaiolo não sentir lentidão
    setPedidos((pedidosAtuais) =>
      pedidosAtuais.map((p) =>
        p.id === id ? { ...p, status: proximoStatus } : p
      )
    );

    try {
      // 2. Chama a Server Action importada diretamente do topo de forma limpa
      const resultado = await updateOrderStatusAction(id, proximoStatus);

      if (!resultado?.success) {
        // Se der erro no banco, desfaz a alteração na tela e avisa o usuário
        setPedidos(pedidosIniciais);
        alert("Erro ao atualizar o status do pedido no servidor.");
      }
    } catch (error) {
      console.error("Erro na requisição do Kanban:", error);
      setPedidos(pedidosIniciais);
    }
  };

  // Filtra os pedidos para renderizar cada um na sua respectiva coluna
  const pendentes = pedidos.filter((p) => p.status === "PENDENTE");
  const preparando = pedidos.filter((p) => p.status === "PREPARANDO");
  const prontos = pedidos.filter((p) => p.status === "PRONTO");

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 items-start h-full">
      <OrderKanbanColumn
        title="📥 Pedidos Pendentes"
        status="PENDENTE"
        pedidos={pendentes}
        onAvancarStatus={handleAvancarStatus}
      />

      <OrderKanbanColumn
        title="🔥 No Forno / Preparando"
        status="PREPARANDO"
        pedidos={preparando}
        onAvancarStatus={handleAvancarStatus}
      />

      <OrderKanbanColumn
        title="📦 Prontos para Entrega"
        status="PRONTO"
        pedidos={prontos}
        onAvancarStatus={handleAvancarStatus}
      />
    </div>
  );
}