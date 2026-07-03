import { productRepository } from "@/modules/product/infrastructure/product.repository";
import { PromoBanner } from "@/components/public/PromoBanner";
import { ProductGrid } from "@/components/public/ProductGrid";

export const revalidate = 60; // ISR: revalida o cardápio a cada 60s

const BANNER_SLIDES = [
  {
    id: "1",
    imageUrl: "/images/banner-combo.jpg",
    title: "Combo Coroa por R$ 64,90",
    subtitle: "2 burgers artesanais + batata grande + refri 600ml",
  },
  {
    id: "2",
    imageUrl: "/images/banner-pizza.jpg",
    title: "Pizza 2 Sabores",
    subtitle: "Monte a sua do jeito que quiser",
  },
];

export default async function HomePage() {
  const categories = await productRepository.findAvailableByCategory();
  const flavorEligible = await productRepository.findFlavorEligible();

  // O Map agora armazena os produtos associados ao slug da categoria
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
      <PromoBanner slides={BANNER_SLIDES} />

      {Array.from(categoriesMap.entries()).map(([slug, items]) => {
        // Encontra a categoria atual para exibir o nome correto
        const categoryName = categories.find(c => c.slug === slug)?.name;

        return (
          <section key={slug} id={slug}>
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