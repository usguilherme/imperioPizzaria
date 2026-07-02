"use client";

import { useEffect, useState, useRef } from 'react';
import { getProductsAction } from '@/actions/product.actions';
import { createOrderAction } from '@/actions/order.actions';
import { useCartStore } from '@/store/cart';

// ----------------------------------------------------------------------
// COMPONENTE DE IMAGEM (Mantido para você editar as fotos)
// ----------------------------------------------------------------------
const ImagemEditavel = ({ srcPadrao, alt, className }: { srcPadrao: string, alt: string, className: string }) => {
  const [imagem, setImagem] = useState(srcPadrao);
  const inputRef = useRef<HTMLInputElement>(null);

  const aoClicar = () => inputRef.current?.click();

  const aoMudarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const urlTemporaria = URL.createObjectURL(file);
      setImagem(urlTemporaria);
    }
  };

  return (
    <div className="relative group cursor-pointer w-full h-full overflow-hidden" onClick={aoClicar}>
      <img src={imagem} alt={alt} className={`w-full h-full object-cover ${className}`} />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">
          📷 Alterar
        </span>
      </div>
      <input type="file" ref={inputRef} onChange={aoMudarArquivo} className="hidden" accept="image/*" />
    </div>
  );
};

// ----------------------------------------------------------------------
// PÁGINA PRINCIPAL
// ----------------------------------------------------------------------
export default function Page() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [address, setAddress] = useState(""); // Adicionado estado para o endereço
  
  const { items, addItem, removeItem, getTotal, clearCart } = useCartStore();

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const dados = await getProductsAction();
        if (dados) setProdutos(dados);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };
    carregarProdutos();
  }, []);

  // Função que salva no banco e manda para o WhatsApp do cliente
  const handleFinalizarPedido = async () => {
    if (!address.trim()) {
        alert("Por favor, informe o endereço de entrega.");
        return;
    }

    setIsFinalizando(true);

    try {
      const itensParaBanco = items.map(item => ({
        id: item.id,
        quantidade: item.quantidade,
        preco: item.preco
      }));

      // Chamada da action atualizada para incluir o endereço
      const response = await createOrderAction(itensParaBanco, getTotal(), address);

      if (response.success) {
        let texto = `*NOVO PEDIDO (Via Site)* 🍕\n\n`;
        texto += `*Endereço:* ${address}\n\n`; // Adicionado ao texto do WhatsApp
        texto += `*Itens:*\n`;
        items.forEach(item => {
          texto += `- ${item.quantidade}x ${item.nome} (R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')})\n`;
        });
        texto += `\n*Total: R$ ${getTotal().toFixed(2).replace('.', ',')}*`;

        const numeroWhatsApp = "5583987009500";
        const urlZap = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;

        clearCart();
        setIsCartOpen(false);
        setAddress(""); // Limpa o campo de endereço
        window.open(urlZap, '_blank'); 
      } else {
        alert("Ocorreu um erro ao salvar o pedido. Tente novamente.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setIsFinalizando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20 font-sans text-zinc-900 overflow-x-hidden relative">
      
      {/* HEADER */}
      <header className="relative w-full h-[220px] bg-zinc-800">
        <div className="absolute inset-0 opacity-60">
           <ImagemEditavel srcPadrao="/capa.jpg" alt="Capa" className="" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto h-full flex items-end px-4 pb-6 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="w-20 h-20 bg-green-600 rounded-xl border-2 border-white flex items-center justify-center shadow-md overflow-hidden">
               <ImagemEditavel srcPadrao="/logo.png" alt="Império Pizza" className="" />
            </div>
            
            <div className="text-white drop-shadow-md">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Império Pizza 🍕
              </h1>
              <p className="text-sm font-medium mt-1 text-zinc-200">
                Rua Major Belmiro, 225 - São José, Campina Grande, PB
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* BARRA DE ENTREGA E CARRINHO */}
      <div className="bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 font-semibold text-zinc-800 hover:text-red-600 transition">
              <span className="text-xl">🛵</span> 
              ENTREGA <span className="text-xs">▼</span>
            </button>
            <div className="h-8 w-px bg-zinc-300 hidden md:block"></div>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-bold hover:bg-red-700 transition relative"
          >
            🛒 <span className="hidden sm:inline">Carrinho</span>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 w-6 h-6 flex items-center justify-center rounded-full text-xs font-black shadow-sm border border-white">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-6">
        <h2 className="text-xl font-bold text-zinc-800 mb-6 border-b border-zinc-200 pb-2">Nosso Cardápio</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtos && produtos.length > 0 ? (
            produtos.map((pizza: any) => (
              <div 
                key={pizza.id} 
                className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow flex flex-col justify-between gap-4 h-[200px]"
              >
                <div className="flex justify-between gap-4 flex-1">
                  <div className="flex flex-col flex-1">
                    <h3 className="font-semibold text-zinc-800 text-base leading-tight">{pizza.nome}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {pizza.descricao || 'Deliciosa pizza com ingredientes selecionados.'}
                    </p>
                    <div className="mt-auto pt-2">
                      <span className="text-green-600 font-bold text-lg">
                        R$ {Number(pizza.preco).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                  <div className="w-[90px] h-[90px] rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 relative">
                    <ImagemEditavel srcPadrao={pizza.imagemUrl || "/pizza-placeholder.jpg"} alt={pizza.nome} className="" />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    addItem({
                      id: pizza.id,
                      nome: pizza.nome,
                      preco: Number(pizza.preco),
                      imagemUrl: pizza.imagemUrl || "/pizza-placeholder.jpg"
                    });
                    setIsCartOpen(true);
                  }}
                  className="w-full bg-zinc-100 hover:bg-red-50 text-red-600 font-bold py-2 rounded-lg transition-colors border border-zinc-200 hover:border-red-200 text-sm"
                >
                  + Adicionar
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-white rounded-xl border border-zinc-200 text-zinc-500">
              O cardápio está sendo atualizado. Nenhuma pizza encontrada.
            </div>
          )}
        </div>
      </main>

      {/* OVERLAY DO CARRINHO */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* PAINEL LATERAL DO CARRINHO */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <h2 className="text-xl font-bold text-zinc-800">Seu Pedido 🍕</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-zinc-500 hover:text-red-600 font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
              <span className="text-4xl">🛒</span>
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white p-3 rounded-lg border border-zinc-100 shadow-sm">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-zinc-100 flex-shrink-0">
                    <img src={item.imagemUrl!} alt={item.nome} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-zinc-800 text-sm leading-tight">{item.nome}</h4>
                      <p className="text-green-600 font-bold text-sm mt-1">
                        R$ {item.preco.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs bg-zinc-100 px-2 py-1 rounded font-medium text-zinc-600">
                        Qtd: {item.quantidade}
                      </span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RODAPÉ DO CARRINHO */}
        {items.length > 0 && (
          <div className="p-4 border-t border-zinc-200 bg-white">
            {/* Campo de Endereço Adicionado */}
            <div className="mb-4">
               <label className="block text-sm font-bold text-zinc-700 mb-1">Endereço de entrega</label>
               <input 
                 type="text"
                 value={address} 
                 onChange={(e) => setAddress(e.target.value)} 
                 className="w-full border border-zinc-300 p-2 rounded-lg outline-none focus:border-red-500" 
                 placeholder="Rua, Número, Bairro..." 
               />
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-zinc-600 font-medium">Total:</span>
              <span className="text-2xl font-black text-green-600">
                R$ {getTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button 
              onClick={handleFinalizarPedido}
              disabled={isFinalizando}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-md text-lg disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isFinalizando ? "Processando..." : "Finalizar Pedido"}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}