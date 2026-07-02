import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Menu Lateral (Sidebar) importado da sua pasta de componentes */}
      <Sidebar />

      {/* Área Principal (Onde as telas vão renderizar) */}
      {/* A classe ml-64 (margin-left: 256px) é necessária para que o conteúdo não fique escondido atrás do Sidebar fixo */}
      <main className="flex-1 p-8 overflow-y-auto ml-64">
        {children}
      </main>
    </div>
  );
}