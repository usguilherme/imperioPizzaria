import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories, sizes, crusts] = await Promise.all([
    prisma.product.findUnique({ 
      where: { id: params.id },
      // 🆕 AQUI ESTAVA O FURO! Adicionamos o sizePromos: true
      include: { availableSizes: true, addons: true, availableCrusts: true, sizePromos: true } 
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.pizzaSize.findMany({ where: { isActive: true } }),
    prisma.pizzaCrust.findMany({ where: { isActive: true } })
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Editar produto</h1>
      <ProductForm
        categories={categories}
        // Tipagem explícita adicionada aqui para resolver o ts(7006)
        availableSizes={sizes.map((size: { id: string; name: string }) => ({ id: size.id, name: size.name }))}
        availableCrusts={crusts.map((crust: { id: string; name: string }) => ({ id: crust.id, name: crust.name }))}
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
          availableSizes: product.availableSizes,
          availableCrusts: product.availableCrusts, 
          addons: product.addons.map((a: { name: string; price: any }) => ({
            name: a.name,
            price: Number(a.price),
          })),
          // 🆕 AQUI! Passando as promoções para o formulário e convertendo o Decimal pra Number
          sizePromos: product.sizePromos.map((sp: { sizeId: string; promoPrice: any }) => ({
            sizeId: sp.sizeId,
            promoPrice: Number(sp.promoPrice),
          })),
        }}
      />
    </div>
  );
}