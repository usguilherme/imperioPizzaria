"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/Button";
import { ProductSchemaInput } from "@/modules/product/application/validators/product.schema";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initialData?: ProductSchemaInput & { id: string };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProductSchemaInput>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    imageUrl: initialData?.imageUrl ?? "",
    type: initialData?.type ?? "SIMPLE",
    servesInfo: initialData?.servesInfo ?? "",
    originalPrice: initialData?.originalPrice ?? 0,
    promoPrice: initialData?.promoPrice ?? null,
    isPromoActive: initialData?.isPromoActive ?? false,
    isFlavorEligible: initialData?.isFlavorEligible ?? false,
    categoryId: initialData?.categoryId ?? categories[0]?.id ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = initialData
        ? await updateProductAction(initialData.id, form)
        : await createProductAction(form);

      if (!result.success) {
        setError(result.error ?? "Erro ao salvar produto");
        return;
      }

      router.push("/admin/produtos");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-900/40 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground-muted">Título</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground-muted">Descrição</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground-muted">URL da Imagem</label>
        <input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          placeholder="https://..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-muted">Categoria</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-muted">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "SIMPLE" | "PIZZA" })}
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            <option value="SIMPLE">Item simples</option>
            <option value="PIZZA">Pizza (permite 2 sabores)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground-muted">
          Rendimento (opcional)
        </label>
        <input
          value={form.servesInfo ?? ""}
          onChange={(e) => setForm({ ...form, servesInfo: e.target.value })}
          placeholder="Ex: Serve 4 pessoas"
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-muted">Preço original (R$)</label>
          <input
            type="number"
            step="0.01"
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-muted">Preço promocional (R$)</label>
          <input
            type="number"
            step="0.01"
            value={form.promoPrice ?? ""}
            onChange={(e) =>
              setForm({ ...form, promoPrice: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-foreground-muted">
          <input
            type="checkbox"
            checked={form.isPromoActive}
            onChange={(e) => setForm({ ...form, isPromoActive: e.target.checked })}
            className="accent-primary"
          />
          Promoção ativa
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground-muted">
          <input
            type="checkbox"
            checked={form.isFlavorEligible}
            onChange={(e) => setForm({ ...form, isFlavorEligible: e.target.checked })}
            className="accent-primary"
          />
          Elegível como sabor de pizza
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar produto"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
