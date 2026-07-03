import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { PizzaSizeForm } from "@/components/admin/PizzaSizeForm";

const prisma = new PrismaClient();

export default async function EditarTamanhoPage({
  params,
}: {
  params: { id: string };
}) {
  const tamanho = await prisma.pizzaSize.findUnique({
    where: { id: params.id },
  });

  if (!tamanho) {
    notFound();
  }

  const initialData = {
    id: tamanho.id,
    name: tamanho.name,
    price: Number(tamanho.price),
    maxFlavors: tamanho.maxFlavors,
    isActive: tamanho.isActive,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Editar Tamanho</h1>
        <p className="text-sm text-foreground-subtle">
          Altere as informações, preço ou limite de sabores deste tamanho.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background-surface p-6">
        <PizzaSizeForm initialData={initialData} />
      </div>
    </div>
  );
}