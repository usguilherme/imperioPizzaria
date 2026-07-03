"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
// Importaremos as actions que vamos criar no próximo passo
import { createPizzaSizeAction, updatePizzaSizeAction } from "@/actions/pizza-size.actions";

export interface PizzaSizeSchemaInput {
  name: string;
  price: number;
  maxFlavors: number;
  isActive: boolean;
}

interface PizzaSizeFormProps {
  initialData?: PizzaSizeSchemaInput & { id: string };
}

export function PizzaSizeForm({ initialData }: PizzaSizeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PizzaSizeSchemaInput>({
    name: initialData?.name ?? "",
    price: initialData?.price ?? 0,
    maxFlavors: initialData?.maxFlavors ?? 2,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = initialData
        ? await updatePizzaSizeAction(initialData.id, form)
        : await createPizzaSizeAction(form);

      if (!result?.success) {
        setError(result?.error ?? "Erro ao salvar tamanho");
        return;
      }

      router.push("/admin/tamanhos");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-900/40 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground-muted">Nome do Tamanho</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          placeholder="Ex: Família, Grande, Broto"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-muted">Preço Fixo (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-muted">Máx. Sabores</label>
          <input
            type="number"
            min="1"
            max="4"
            value={form.maxFlavors}
            onChange={(e) => setForm({ ...form, maxFlavors: Number(e.target.value) })}
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground-muted">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="accent-primary"
        />
        Tamanho ativo (visível para clientes)
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar tamanho"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}