import { getProductsAction, deleteProductAction } from '@/actions/product.actions';
import Link from 'next/link';

export default async function AdminProdutosPage() {
  const dadosProdutos = await getProductsAction();

  // Tratamento seguro para garantir que os valores Decimais do banco 
  // sejam convertidos em números comuns, evitando erros de serialização do Next.js
  const produtos = dadosProdutos?.map((p: any) => ({
    ...p,
    preco: Number(p.preco)
  })) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800">Produtos</h1>
          <p className="text-zinc-500 mt-1">Gerencie o cardápio da sua pizzaria.</p>
        </div>
        <Link 
          href="/admin/produtos/novo" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm"
        >
          + Novo Produto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="p-4 font-semibold text-zinc-600">Nome</th>
              <th className="p-4 font-semibold text-zinc-600 hidden md:table-cell">Descrição</th>
              <th className="p-4 font-semibold text-zinc-600">Preço</th>
              <th className="p-4 font-semibold text-zinc-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length > 0 ? (
              produtos.map((produto) => (
                <tr key={produto.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition">
                  <td className="p-4 font-medium text-zinc-800">{produto.nome}</td>
                  <td className="p-4 text-zinc-500 truncate max-w-xs hidden md:table-cell">
                    {produto.descricao || 'Sem descrição'}
                  </td>
                  <td className="p-4 font-semibold text-green-600">
                    R$ {produto.preco.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="p-4 flex gap-3 justify-end items-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition">
                      Editar
                    </button>
                    
                    {/* Botão de Excluir Funcional */}
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={produto.id} />
                      <button 
                        type="submit" 
                        className="text-red-600 hover:text-red-800 font-medium text-sm transition"
                      >
                        Excluir
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}