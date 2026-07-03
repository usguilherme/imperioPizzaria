import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm"; 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function EditarCategoriaPage({
  params,
}: {
  params: { id: string };
}) {
  const categoria = await prisma.category.findUnique({
    where: { id: params.id },
  });

  if (!categoria) {
    notFound();
  }

  // Prepara os dados iniciais no formato esperado pelo CategoryForm
  const initialData = {
    id: categoria.id,
    name: categoria.name,
    slug: categoria.slug,
    order: categoria.order,
    isActive: categoria.isActive,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Editar Categoria</h1>
        <p className="text-sm text-foreground-subtle">
          Modifique o nome, ordem ou a visibilidade desta categoria.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background-surface p-6">
        <CategoryForm initialData={initialData} />
      </div>
    </div>
  );
}