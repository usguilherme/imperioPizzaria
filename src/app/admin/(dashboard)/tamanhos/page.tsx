export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TamanhosPage() {
  // Busca os tamanhos ordenados pelo preço (do mais barato ao mais caro)
  const tamanhos = await prisma.pizzaSize.findMany({
    orderBy: { price: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Tamanhos de Pizza</h1>
          <p className="text-sm text-foreground-subtle">
            Gerencie os tamanhos (Pequena, Grande) e os preços fixos de cada um.
          </p>
        </div>
        <Link href="/admin/tamanhos/nova">
          <Button className="gap-2">
            <Plus size={18} />
            Novo Tamanho
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background-elevated">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground-muted">Nome</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Preço Fixo</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Máx. Sabores</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Status</th>
              <th className="px-4 py-3 font-medium text-foreground-muted text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tamanhos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground-subtle">
                  Nenhum tamanho cadastrado.
                </td>
              </tr>
            ) : (
              tamanhos.map((tamanho) => (
                <tr key={tamanho.id} className="transition-colors hover:bg-background-elevated/50">
                  <td className="px-4 py-3 font-medium text-foreground">{tamanho.name}</td>
                  <td className="px-4 py-3 font-bold text-primary">
                    {formatCurrency(Number(tamanho.price))}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">Até {tamanho.maxFlavors}</td>
                  <td className="px-4 py-3">
                    {tamanho.isActive ? (
                      <Badge variant="success">Ativo</Badge>
                    ) : (
                      <Badge variant="danger">Inativo</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/tamanhos/${tamanho.id}`}>
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