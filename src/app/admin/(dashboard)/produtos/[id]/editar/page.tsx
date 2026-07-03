import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories, sizes] = await Promise.all([
    prisma.product.findUnique({ 
      where: { id: params.id },
      include: { availableSizes: true } 
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.pizzaSize.findMany({ where: { isActive: true } })
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Editar produto</h1>
      <ProductForm
        categories={categories}
        availableSizes={sizes}
        initialData={{
          id: product.id,
          title: product.title,
          description: product.description,
          imageUrl: product.imageUrl,
          type: product.type,
          servesInfo: product.servesInfo,
          originalPrice: Number(product.originalPrice),
          promoPrice: product.promoPrice != null ? Number(product.promoPrice) : null,
          isPromoActive: product.isPromoActive,
          isFlavorEligible: product.isFlavorEligible,
          categoryId: product.categoryId,
          availableSizes: product.availableSizes, // Passando os tamanhos atuais do produto
        }}
      />
    </div>
  );
}