import { productRepository } from "@/modules/product/infrastructure/product.repository";
import { ProductGrid } from "@/components/public/ProductGrid";
import { Flame } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const categories = await productRepository.findAvailableByCategory();
  const flavorEligible = await productRepository.findFlavorEligible();

  // Filtra todos os produtos que estão em promoção em qualquer categoria
  const promoProducts = categories.flatMap((category) =>
    category.products.filter((p) => p.isPromoActive && p.promoPrice != null)
  );

  const categoriesMap = new Map<string, typeof categories[0]['products']>();
  
  for (const category of categories) {
    categoriesMap.set(category.slug, category.products);
  }

  const flavorOptions = flavorEligible.map((f) => ({
    id: f.id,
    title: f.title,
    imageUrl: f.imageUrl,
    price: f.isPromoActive && f.promoPrice ? Number(f.promoPrice) : Number(f.originalPrice),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-10">
      
      {/* Seção de Promoções Fixa no Topo */}
      {promoProducts.length > 0 && (
        <section id="promocoes" className="scroll-mt-24">
          <h2 className="mb-4 font-display text-2xl font-bold text-primary flex items-center gap-2">
            <Flame className="text-primary" fill="currentColor" />
            Promoções da Casa
          </h2>
          <ProductGrid
            flavorOptions={flavorOptions}
            products={promoProducts.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              imageUrl: p.imageUrl,
              servesInfo: p.servesInfo,
              originalPrice: Number(p.originalPrice),
              promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
              isPromoActive: p.isPromoActive,
              isPizza: p.type === "PIZZA",
            }))}
          />
        </section>
      )}

      {/* Restante das Categorias Normais */}
      {Array.from(categoriesMap.entries()).map(([slug, items]) => {
        const categoryName = categories.find(c => c.slug === slug)?.name;

        return (
          <section key={slug} id={slug} className="scroll-mt-24">
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
              {categoryName}
            </h2>
            <ProductGrid
              flavorOptions={flavorOptions}
              products={items.map((p) => ({
                id: p.id,
                title: p.title,
                description: p.description,
                imageUrl: p.imageUrl,
                servesInfo: p.servesInfo,
                originalPrice: Number(p.originalPrice),
                promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
                isPromoActive: p.isPromoActive,
                isPizza: p.type === "PIZZA",
              }))}
            />
          </section>
        );
      })}
    </div>
  );
}