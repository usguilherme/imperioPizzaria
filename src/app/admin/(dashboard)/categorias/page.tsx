export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
// Importação direta do cliente do Prisma
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function CategoriasPage() {
  // Busca as categorias ordenadas pelo campo "order"
  const categorias = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-sm text-foreground-subtle">
            Gerencie as categorias do seu cardápio.
          </p>
        </div>
        <Link href="/admin/categorias/nova">
          <Button className="gap-2">
            <Plus size={18} />
            Nova Categoria
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background-elevated">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground-muted">Ordem</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Nome</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Slug</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Status</th>
              <th className="px-4 py-3 font-medium text-foreground-muted text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground-subtle">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            ) : (
              categorias.map((categoria) => (
                <tr key={categoria.id} className="transition-colors hover:bg-background-elevated/50">
                  <td className="px-4 py-3 text-foreground-muted">{categoria.order}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{categoria.name}</td>
                  <td className="px-4 py-3 text-foreground-muted">{categoria.slug}</td>
                  <td className="px-4 py-3">
                    {categoria.isActive ? (
                      <Badge variant="success">Ativa</Badge>
                    ) : (
                      <Badge variant="danger">Inativa</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/categorias/${categoria.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                        <Edit2 size={16} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}