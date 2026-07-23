"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react"; // Ou o ícone que você usa

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    // Formata para garantir que fique maiúsculo e sem espaços
    const formattedCode = code.trim().toUpperCase();
    
    // ⚠️ IMPORTANTE: Ajuste "/pedido/" para a rota real que você usa 
    // para exibir o status do pedido (ex: /order, /status, etc)
    router.push(`/pedido/${formattedCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-white">
      <div className="w-full max-w-md bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h1 className="text-2xl font-bold mb-2 text-center">Acompanhar Pedido</h1>
        <p className="text-zinc-400 text-sm text-center mb-6">
          Perdeu o link? Digite o código do seu pedido abaixo para ver o status em tempo real.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div>
            <label htmlFor="code" className="sr-only">Código do Pedido</label>
            <div className="relative">
              <input
                id="code"
                type="text"
                placeholder="Ex: IMP-88XQI"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
              />
              <Search className="absolute right-4 top-3.5 text-zinc-500 w-5 h-5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Buscar Pedido
          </button>
        </form>
      </div>
    </div>
  );
}