import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Novo produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
