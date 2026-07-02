"use client";

import { useEffect, useState, useRef } from 'react';
import { getProductsAction } from '@/actions/product.actions';
import { createOrderAction } from '@/actions/order.actions';
import { useCartStore } from '@/store/cart';

// ----------------------------------------------------------------------
// COMPONENTE DE IMAGEM 
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
        <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full border border-zinc-400">
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
  const [address, setAddress] = useState(""); 
  
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

      const response = await createOrderAction(itensParaBanco, getTotal(), address);

      if (response.success) {
        let texto = `*NOVO PEDIDO (Via Site)* 🍕\n\n`;
        texto += `*Endereço:* ${address}\n\n`; 
        texto += `*Itens:*\n`;
        items.forEach(item => {
          texto += `- ${item.quantidade}x ${item.nome} (R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')})\n`;
        });
        texto += `\n*Total: R$ ${getTotal().toFixed(2).replace('.', ',')}*`;

        const numeroWhatsApp = "5583987009500";
        const urlZap = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;

        clearCart();
        setIsCartOpen(false);
        setAddress(""); 
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
    <div className="min-h-screen bg-zinc-100 pb-20 font-sans text-zinc-900 overflow-x-hidden relative selection:bg-orange-600 selection:text-white">
      
      {/* HEADER ESCURO (ZINC-900) COM DETALHES LARANJAS */}
      <header className="relative w-full h-[240px] bg-zinc-900 border-b-4 border-orange-600">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
           <ImagemEditavel srcPadrao="/capa.jpg" alt="Capa" className="" />
        </div>
        
        {/* Efeito de Gradiente para dar leitura ao texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto h-full flex items-end px-4 pb-8 pointer-events-none">
          <div className="flex items-center gap-5 pointer-events-auto">
            <div className="w-24 h-24 bg-zinc-800 rounded-2xl border-2 border-orange-500 flex items-center justify-center shadow-2xl overflow-hidden">
               <ImagemEditavel srcPadrao="/logo.png" alt="Império Pizza" className="" />
            </div>
            
            <div className="text-white drop-shadow-lg">
              <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-2">
                Império <span className="text-orange-500">Pizza</span>
              </h1>
              <p className="text-sm font-medium mt-1 text-zinc-300 flex items-center gap-2">
                📍 Rua Major Belmiro, 225 - São José, Campina Grande, PB
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* BARRA DE ENTREGA E CARRINHO */}
      <div className="bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 font-bold text-zinc-800 hover:text-orange-600 transition tracking-wide">
              <span className="text-xl">🛵</span> 
              DELIVERY <span className="text-xs text-orange-500">▼</span>
            </button>
            <div className="h-6 w-px bg-zinc-300 hidden md:block"></div>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-full font-black tracking-wide hover:bg-orange-700 transition relative shadow-md"
          >
            🛒 <span className="hidden sm:inline">MEU PEDIDO</span>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-zinc-900 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-black shadow-sm border-2 border-white">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ÁREA DO CARDÁPIO */}
      <main className="max-w-5xl mx-auto px-4 mt-10">
        <h2 className="text-2xl font-black text-zinc-900 mb-8 border-l-4 border-orange-600 pl-3 uppercase tracking-tight">
          Nosso Cardápio
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos && produtos.length > 0 ? (
            produtos.map((pizza: any) => (
              <div 
                key={pizza.id} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col justify-between gap-4 h-[220px] group"
              >
                <div className="flex justify-between gap-4 flex-1">
                  <div className="flex flex-col flex-1">
                    <h3 className="font-bold text-zinc-900 text-lg leading-tight group-hover:text-orange-600 transition-colors">{pizza.nome}</h3>
                    <p className="text-sm text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                      {pizza.descricao || 'Deliciosa pizza com ingredientes premium selecionados.'}
                    </p>
                    <div className="mt-auto pt-2">
                      <span className="text-zinc-900 font-black text-lg">
                        R$ {Number(pizza.preco).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                  <div className="w-[100px] h-[100px] rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100 relative shadow-inner">
                    <ImagemEditavel srcPadrao={pizza.imagemUrl || "/pizza-placeholder.jpg"} alt={pizza.nome} className="group-hover:scale-110 transition-transform duration-500" />
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
                  className="w-full bg-zinc-900 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors duration-300 uppercase tracking-wider text-xs"
                >
                  Adicionar ao Pedido
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-zinc-200 shadow-sm">
              <span className="text-4xl block mb-3">🍕</span>
              <p className="text-zinc-500 font-medium text-lg">O cardápio está sendo atualizado no momento.</p>
            </div>
          )}
        </div>
      </main>

      {/* OVERLAY DO CARRINHO */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* PAINEL LATERAL DO CARRINHO */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-zinc-50 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-zinc-200 flex justify-between items-center bg-white">
          <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Seu Pedido 🍕</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-zinc-400 hover:text-orange-600 font-bold text-xl px-2 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3">
              <span className="text-5xl opacity-50">🛒</span>
              <p className="font-medium">Seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                    <img src={item.imagemUrl!} alt={item.nome} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm leading-tight">{item.nome}</h4>
                      <p className="text-orange-600 font-black text-sm mt-1">
                        R$ {item.preco.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs bg-zinc-100 px-2.5 py-1 rounded-md font-bold text-zinc-600 border border-zinc-200">
                        Qtd: {item.quantidade}
                      </span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-zinc-400 hover:text-red-600 font-bold uppercase transition-colors"
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

        {/* RODAPÉ DO CARRINHO COM CHECKOUT */}
        {items.length > 0 && (
          <div className="p-5 border-t border-zinc-200 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="mb-5">
               <label className="block text-xs font-black text-zinc-900 uppercase tracking-wider mb-2">
                 Endereço de Entrega
               </label>
               <input 
                 type="text"
                 value={address} 
                 onChange={(e) => setAddress(e.target.value)} 
                 className="w-full border-2 border-zinc-200 bg-zinc-50 p-3 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-medium" 
                 placeholder="Ex: Rua São José, 123 - Apto 4" 
               />
            </div>

            <div className="flex justify-between items-center mb-5 border-t border-zinc-100 pt-4">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-sm">Total a pagar:</span>
              <span className="text-3xl font-black text-zinc-900">
                R$ {getTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button 
              onClick={handleFinalizarPedido}
              disabled={isFinalizando}
              className="w-full bg-orange-600 text-white font-black py-4 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 text-sm uppercase tracking-widest disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isFinalizando ? "Processando..." : "Finalizar Pedido via WhatsApp"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}