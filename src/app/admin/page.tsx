import { getPedidosGeraisAction, getProductsAction } from '@/actions/product.actions';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  // Busca os dados usando as actions que já criamos
  const pedidos = await getPedidosGeraisAction();
  const produtos = await getProductsAction();

  // Cálculos rápidos para as estatísticas
  const faturamentoTotal = pedidos.reduce((acc, pedido) => acc + pedido.total, 0);
  const pedidosEmAndamento = pedidos.filter(p => ['PENDENTE', 'PREPARANDO'].includes(p.status)).length;
  const totalProdutos = produtos.length;
  const pedidosEntregues = pedidos.filter(p => p.status === 'ENTREGUE').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-800">Visão Geral</h1>
        <p className="text-zinc-500 mt-1">Bem-vindo ao painel de controle da Império Pizzaria.</p>
      </div>

      {/* Grid de Cards Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card de Faturamento */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between">
          <h3 className="text-zinc-500 font-medium text-sm">Faturamento Total</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            R$ {faturamentoTotal.toFixed(2).replace('.', ',')}
          </p>
        </div>

        {/* Card de Pedidos Ativos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between">
          <h3 className="text-zinc-500 font-medium text-sm">Na Cozinha (Ativos)</h3>
          <p className="text-3xl font-bold text-amber-500 mt-2">{pedidosEmAndamento}</p>
        </div>

        {/* Card de Pedidos Concluídos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between">
          <h3 className="text-zinc-500 font-medium text-sm">Pedidos Entregues</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{pedidosEntregues}</p>
        </div>

        {/* Card de Produtos Cadastrados */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between">
          <h3 className="text-zinc-500 font-medium text-sm">Itens no Cardápio</h3>
          <p className="text-3xl font-bold text-zinc-800 mt-2">{totalProdutos}</p>
        </div>
      </div>

      {/* Acesso Rápido */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-zinc-800 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/cozinha" className="bg-zinc-900 text-white p-4 rounded-xl font-semibold hover:bg-zinc-800 transition flex items-center justify-between">
            <span>👨‍🍳 Acessar Cozinha</span>
            <span>➔</span>
          </Link>
          <Link href="/admin/produtos" className="bg-zinc-900 text-white p-4 rounded-xl font-semibold hover:bg-zinc-800 transition flex items-center justify-between">
            <span>🍕 Gerenciar Cardápio</span>
            <span>➔</span>
          </Link>
          <Link href="/admin/pedidos" className="bg-zinc-900 text-white p-4 rounded-xl font-semibold hover:bg-zinc-800 transition flex items-center justify-between">
            <span>📋 Ver Histórico</span>
            <span>➔</span>
          </Link>
        </div>
      </div>
    </div>
  );
}