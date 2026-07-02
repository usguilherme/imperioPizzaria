import { getCozinhaPedidosAction } from '@/actions/product.actions';
import OrderKanbanBoard from '@/components/admin/OrderKanbanBoard';

export default async function CozinhaPage() {
  // Busca os pedidos diretamente do banco de dados no servidor
  const pedidos = await getCozinhaPedidosAction();

  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold text-zinc-800">Painel da Cozinha</h1>
        <p className="text-zinc-500 mt-1">Acompanhe as comandas em tempo real e gerencie a produção do forno.</p>
      </div>

      {/* Kanban Board central carregado via import padrão padrão */}
      <div className="flex-1 mt-2">
        <OrderKanbanBoard pedidosIniciais={pedidos} />
      </div>
    </div>
  );
}