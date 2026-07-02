"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // Lista de rotas do seu painel administrativo
  const menuItems = [
    { name: 'Pedidos Recebidos', href: '/admin/pedidos', icon: '📝' },
    { name: 'Cardápio', href: '/admin/produtos', icon: '🍕' },
    { name: 'Painel da Cozinha', href: '/admin/cozinha', icon: '👨‍🍳' },
  ];

  return (
    <aside className="w-64 bg-zinc-900 text-white min-h-screen flex flex-col shadow-2xl fixed left-0 top-0">
      {/* Cabeçalho do Sidebar */}
      <div className="mb-8 p-6 border-b border-zinc-800">
        <h2 className="text-2xl font-black text-green-500 tracking-tight">Império Pizza</h2>
        <p className="text-xs text-zinc-400 mt-1 font-medium">Painel Administrativo</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-2 px-4">
        {menuItems.map((item) => {
          // Verifica se a rota atual é a mesma do link para deixar o botão aceso
          const isActive = pathname?.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-green-600 text-white font-bold shadow-md'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white font-medium'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé do Sidebar */}
      <div className="mt-auto p-6 border-t border-zinc-800">
        <Link href="/" className="flex items-center gap-3 text-zinc-400 hover:text-red-400 transition-colors px-4 py-2 font-medium">
          <span className="text-xl">🚪</span>
          Ver a Loja
        </Link>
      </div>
    </aside>
  );
}