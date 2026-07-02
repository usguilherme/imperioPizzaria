import { getCategoriesAction, updateProductAction, getProductByIdAction } from '@/actions/product.actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditarProdutoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProdutoPage({ params }: EditarProdutoPageProps) {
  const { id } = await params;

  // Busca o produto específico pelo ID e as categorias para o select
  const [produto, dadosCategorias] = await Promise.all([
    getProductByIdAction(id),
    getCategoriesAction()
  ]);

  // Se o produto não for encontrado, renderiza a página de 404 nativa do Next.js
  if (!produto) {
    notFound();
  }

  const categorias = dadosCategorias || [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800">Editar Produto</h1>
          <p className="text-zinc-500 mt-1">Atualize as informações do item selecionado.</p>
        </div>
        <Link href="/admin/produtos" className="text-zinc-500 hover:text-zinc-800 font-medium">
          ⬅ Voltar
        </Link>
      </div>

      {/* Formulário chamando a Server Action de atualização diretamente */}
      <form action={updateProductAction} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-4">
        
        {/* Campo oculto contendo o ID do produto para a Server Action saber qual registro atualizar */}
        <input type="hidden" name="id" value={produto.id} />

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Produto</label>
          <input 
            type="text" 
            name="name" 
            defaultValue={produto.nome}
            required 
            className="w-full border border-zinc-300 rounded-lg p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" 
            placeholder="Ex: Pizza Marguerita" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
          <textarea 
            name="description" 
            defaultValue={produto.descricao || ''}
            rows={3} 
            className="w-full border border-zinc-300 rounded-lg p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" 
            placeholder="Ingredientes e detalhes..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Preço (R$)</label>
            <input 
              type="number" 
              name="price" 
              step="0.01" 
              defaultValue={Number(produto.preco)}
              required 
              className="w-full border border-zinc-300 rounded-lg p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" 
              placeholder="0.00" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Categoria</label>
            <select 
              name="categoryId" 
              defaultValue={produto.categoryId}
              required 
              className="w-full border border-zinc-300 rounded-lg p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white"
            >
              <option value="">Selecione uma categoria...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end gap-3">
          <Link
            href="/admin/produtos"
            className="px-6 py-3 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition text-sm font-medium flex items-center justify-center"
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition text-sm"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}