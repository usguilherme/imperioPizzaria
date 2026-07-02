import { getCategoriesAction, createProductAction } from '@/actions/product.actions';
import Link from 'next/link';

export default async function NovoProdutoPage() {
  // Traz as categorias do banco para o campo de seleção
  const dadosCategorias = await getCategoriesAction();
  
  // Garante que seja um array para não quebrar o .map caso o banco retorne vazio
  const categorias = dadosCategorias || [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-800">Novo Produto</h1>
        <Link href="/admin/produtos" className="text-zinc-500 hover:text-zinc-800 font-medium">
          ⬅ Voltar
        </Link>
      </div>

      {/* Formulário chamando a Server Action diretamente */}
      <form action={createProductAction} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-4">
        
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Produto</label>
          <input 
            type="text" 
            name="name" 
            required 
            className="w-full border border-zinc-300 rounded-lg p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" 
            placeholder="Ex: Pizza Marguerita" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
          <textarea 
            name="description" 
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
              required 
              className="w-full border border-zinc-300 rounded-lg p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" 
              placeholder="0.00" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Categoria</label>
            <select 
              name="categoryId" 
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

        <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end">
          <button 
            type="submit" 
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
          >
            Salvar Produto
          </button>
        </div>
      </form>
    </div>
  );
}