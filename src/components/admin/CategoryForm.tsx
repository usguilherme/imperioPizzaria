"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, updateCategoryAction } from "@/actions/category.actions";
import { Button } from "@/components/ui/Button";
import { CategorySchemaInput } from "@/modules/category/application/validators/category.schema";

interface CategoryFormProps {
  initialData?: CategorySchemaInput & { id: string };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugEditedManually, setSlugEditedManually] = useState(!!initialData);

  const [form, setForm] = useState<CategorySchemaInput>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    order: initialData?.order ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugEditedManually ? prev.slug : slugify(value),
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = initialData
        ? await updateCategoryAction(initialData.id, form)
        : await createCategoryAction(form);

      if (!result.success) {
        setError(result.error ?? "Erro ao salvar categoria");
        return;
      }

      router.push("/admin/categorias");
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
        <label className="mb-1 block text-sm font-medium text-foreground-muted">Nome</label>
        <input
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground-muted">Slug</label>
        <input
          value={form.slug}
          onChange={(e) => {
            setSlugEditedManually(true);
            setForm({ ...form, slug: e.target.value });
          }}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          placeholder="ex: pizzas, hamburgueres"
          required
        />
        <p className="mt-1 text-xs text-foreground-subtle">
          Usado na URL. Gerado automaticamente a partir do nome, mas pode editar.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground-muted">Ordem de exibição</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-xs text-foreground-subtle">
          Categorias com número menor aparecem primeiro na loja.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground-muted">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="accent-primary"
        />
        Categoria ativa (visível na loja)
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar categoria"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}