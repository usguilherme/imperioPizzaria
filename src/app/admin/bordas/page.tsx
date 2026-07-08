import { prisma } from "@/lib/prisma";
import { createCrustAction } from "@/actions/crust.actions";
import { Button } from "@/components/ui/Button";
import { CrustItem } from "./CrustItem";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BordasPage() {
  const crusts = await prisma.pizzaCrust.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl">
      {/* BOTÃO DE VOLTAR ADICIONADO AQUI */}
      <Link
        href="/admin"
        className="mb-6 flex w-fit items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Voltar para o Dashboard
      </Link>

      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Gerenciar Bordas</h1>

      <div className="mb-8 rounded-lg border border-border bg-background-surface p-4">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Adicionar nova borda</h2>
        
        <form action={async (formData) => {
          "use server";
          await createCrustAction(formData);
        }} className="flex gap-4 items-end">
          
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-foreground-muted">Nome da Borda</label>
            <input
              name="name"
              placeholder="Ex: Catupiry"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="w-32">
            <label className="mb-1 block text-sm font-medium text-foreground-muted">Preço (R$)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <Button type="submit">Salvar</Button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-background-surface">
        <ul className="divide-y divide-border">
          {crusts.length === 0 ? (
            <li className="p-4 text-sm text-foreground-muted text-center">Nenhuma borda cadastrada ainda.</li>
          ) : (
            crusts.map((crust) => (
              <CrustItem key={crust.id} crust={crust} />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}