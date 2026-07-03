"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProductAction, updateProductAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/Button";
import { ProductSchemaInput } from "@/modules/product/application/validators/product.schema";

interface CategoryOption {
  id: string;
  name: string;
}

interface SizeOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  availableSizes: SizeOption[];
  initialData?: ProductSchemaInput & { id: string; availableSizes?: { id: string }[] };
}

const MAX_IMAGE_SIZE_MB = 3;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ categories, availableSizes, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [form, setForm] = useState<ProductSchemaInput & { availableSizeIds: string[] }>({
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
    availableSizeIds: initialData?.availableSizes?.map(s => s.id) ?? [],
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido (jpg, png, webp...)");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`A imagem deve ter no máximo ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    setError(null);
    setIsProcessingImage(true);
    try {
      const base64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, imageUrl: base64 }));
    } catch {
      setError("Não foi possível carregar essa imagem, tente outro arquivo");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.imageUrl) {
      setError("Selecione uma imagem para o produto");
      return;
    }

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
        <label className="mb-1 block text-sm font-medium text-foreground-muted">Foto do produto</label>
        {form.imageUrl && (
          <div className="relative mb-3 h-40 w-40 overflow-hidden rounded-lg border border-border bg-background-elevated">
            <Image src={form.imageUrl} alt="Prévia da imagem" fill className="object-cover" unoptimized />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-foreground-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-hover"
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

      {/* Seção de Tamanhos Opcionais */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground-muted">Tamanhos Disponíveis</label>
        <div className="flex flex-wrap gap-4 rounded-lg border border-border p-3">
          {availableSizes.length === 0 ? (
            <p className="text-xs text-foreground-muted italic">Nenhum tamanho cadastrado.</p>
          ) : (
            availableSizes.map((size) => (
              <label key={size.id} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={form.availableSizeIds.includes(size.id)}
                  onChange={(e) => {
                    const newIds = e.target.checked
                      ? [...form.availableSizeIds, size.id]
                      : form.availableSizeIds.filter((id) => id !== size.id);
                    setForm({ ...form, availableSizeIds: newIds });
                  }}
                />
                {size.name}
              </label>
            ))
          )}
        </div>
        <p className="text-xs text-foreground-subtle">
          * Deixe vazio para permitir todos os tamanhos cadastrados.
        </p>
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
            onChange={(e) => setForm({ ...form, promoPrice: e.target.value ? Number(e.target.value) : null })}
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
        <Button type="submit" disabled={isPending || isProcessingImage}>
          {isPending ? "Salvando..." : "Salvar produto"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}