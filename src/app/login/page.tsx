"use client";

import { useState } from 'react';
import { loginAction } from '@/actions/auth.actions';

export default function LoginPage() {
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setErro(result.error);
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-md bg-zinc-800 rounded-3xl p-8 shadow-2xl border border-zinc-700">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 border-2 border-orange-500 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-inner">
            🔒
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Área Restrita</h1>
          <p className="text-zinc-400 text-sm mt-2">Insira a credencial administrativa para acessar o sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Senha de Acesso
            </label>
            <input 
              type="password" 
              name="senha"
              required
              placeholder="••••••••"
              className="w-full bg-zinc-900 border-2 border-zinc-700 text-white p-4 rounded-xl outline-none focus:border-orange-500 transition-colors font-mono"
            />
          </div>

          {erro && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm font-medium text-center">
              {erro}
            </div>
          )}

          <button 
            type="submit"
            disabled={carregando}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition-colors text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {carregando ? 'Autenticando...' : 'Acessar Painel'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="text-zinc-500 hover:text-orange-500 text-sm font-medium transition-colors">
            ← Voltar para a loja
          </a>
        </div>
      </div>
    </div>
  );
}