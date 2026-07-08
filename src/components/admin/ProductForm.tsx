"use client";
import imageCompression from 'browser-image-compression';
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProductAction, updateProductAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/Button";
import { ProductSchemaInput } from "@/modules/product/application/validators/product.schema";
import { Trash2, Plus } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface SizeOption {
  id: string;
  name: string;
}

// NOVA INTERFACE PARA BORDAS
interface CrustOption {
  id: string;
  name: string;
}

type Addon = { name: string; price: number };

interface ProductFormProps {
  categories: CategoryOption[];
  availableSizes: SizeOption[];
  availableCrusts: CrustOption[]; // ADICIONADO AQUI
  initialData?: ProductSchemaInput & { 
    id: string; 
    availableSizes?: { id: string }[];
    availableCrusts?: { id: string }[]; // ADICIONADO AQUI
    addons?: Addon[];
  };
}

const MAX_IMAGE_SIZE_MB = 10;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ categories, availableSizes, availableCrusts, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [form, setForm] = useState({
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
    availableCrustIds: initialData?.availableCrusts?.map(c => c.id) ?? [], // ADICIONADO AQUI
    addons: (initialData?.addons ?? []) as Addon[]
  });

  const addAddon = () => {
    setForm((prev) => ({ 
      ...prev, 
      addons: [...prev.addons, { name: "", price: 0 }] 
    }));
  };
  
  const removeAddon = (index: number) => {
    setForm((prev) => ({ 
      ...prev, 
      addons: prev.addons.filter((_, i) => i !== index) 
    }));
  };

  const updateAddon = (index: number, field: 'name' | 'price', value: string | number) => {
    setForm((prev) => {
      const newAddons = [...prev.addons];
      newAddons[index] = { 
        ...newAddons[index], 
        [field]: value 
      } as Addon;
      return { ...prev, addons: newAddons };
    });
  };

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
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        });
        
        const base64 = await fileToBase64(compressedFile);
        setForm((prev) => ({ ...prev, imageUrl: base64 }));
      } catch {
        setError("Não foi possível processar essa imagem, tente outro arquivo");
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
        ? await updateProductAction(initialData.id, form as any)
        : await createProductAction(form as any);

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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground-muted">Tamanhos Disponíveis</label>
        <div className="flex flex-wrap gap-4 rounded-lg border border-border p-3">
          {availableSizes.map((size) => (
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
          ))}
        </div>
      </div>

      {/* NOVA SEÇÃO DE BORDAS AQUI */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground-muted">Bordas Disponíveis</label>
        <div className="flex flex-wrap gap-4 rounded-lg border border-border p-3">
          {availableCrusts?.map((crust) => (
            <label key={crust.id} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="accent-primary"
                checked={form.availableCrustIds.includes(crust.id)}
                onChange={(e) => {
                  const newIds = e.target.checked
                    ? [...form.availableCrustIds, crust.id]
                    : form.availableCrustIds.filter((id) => id !== crust.id);
                  setForm({ ...form, availableCrustIds: newIds });
                }}
              />
              {crust.name}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground-muted">Adicionais</label>
          <Button type="button" variant="ghost" size="sm" onClick={addAddon} className="gap-1">
            <Plus size={14} /> Novo
          </Button>
        </div>
        {form.addons.map((addon, index) => (
          <div key={index} className="flex gap-2">
            <input 
              placeholder="Nome (ex: Bacon)" 
              value={addon.name} 
              onChange={(e) => updateAddon(index, 'name', e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background-surface px-3 py-2 text-sm"
              required
            />
            <input 
              type="number" 
              placeholder="Preço" 
              step="0.01"
              value={addon.price} 
              onChange={(e) => updateAddon(index, 'price', Number(e.target.value))}
              className="w-24 rounded-lg border border-border bg-background-surface px-3 py-2 text-sm"
              required
            />
            <Button type="button" variant="ghost" className="text-red-500" onClick={() => removeAddon(index)}>
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
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