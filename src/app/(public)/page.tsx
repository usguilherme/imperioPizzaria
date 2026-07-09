import { productRepository } from "@/modules/product/infrastructure/product.repository";
import { ProductGrid } from "@/components/public/ProductGrid";
import { Flame } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const categories = await productRepository.findAvailableByCategory();
  const flavorEligible = await productRepository.findFlavorEligible();

  const promoProducts = categories.flatMap((category) =>
    category.products.filter((p) => p.isPromoActive && p.promoPrice != null)
  );

  const categoriesMap = new Map<string, (typeof categories)[0]["products"]>();

  for (const category of categories) {
    categoriesMap.set(category.slug, category.products);
  }

  // Sabores disponíveis para a montagem de pizza (usados como availableFlavors no modal)
  const flavorOptions = flavorEligible.map((f) => ({
    id: f.id,
    title: f.title,
    imageUrl: f.imageUrl,
    price: f.isPromoActive && f.promoPrice ? Number(f.promoPrice) : Number(f.originalPrice ?? 0),
  }));

  /**
   * Mapeia os registros de `Size` (tabela compartilhada, conectada ao produto
   * via `availableSizes`) para o formato SizeOption que o PizzaBuilderModal espera.
   *
   * Assumindo que o model `Size` tem os campos: id, name, price, maxFlavors.
   * Se o campo `maxFlavors` não existir no seu `Size` (ex: só id/name/price),
   * troque a linha `maxFlavors: s.maxFlavors ?? 2` por `maxFlavors: 2` fixo.
   */
  function mapSizesToOptions(sizes: { id: string; name: string; price: unknown; maxFlavors?: number }[]) {
    return sizes.map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      maxFlavors: s.maxFlavors ?? 2,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mapProduct(p: any) {
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      servesInfo: p.servesInfo,
      originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
      promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
      isPromoActive: p.isPromoActive,
      isPizza: p.type === "PIZZA",
      addons: p.addons ? p.addons.map((a: { name: string; price: unknown }) => ({ name: a.name, price: Number(a.price) })) : [],
      // NOVO: tamanhos deste produto, vindos do relacionamento availableSizes
      sizeOptions: p.availableSizes ? mapSizesToOptions(p.availableSizes) : [],
    };
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-10">
      {promoProducts.length > 0 && (
        <section id="promocoes" className="scroll-mt-24">
          <h2 className="mb-4 font-display text-2xl font-bold text-primary flex items-center gap-2">
            <Flame className="text-primary" fill="currentColor" />
            Promoções da Casa
          </h2>
          <ProductGrid
            flavorOptions={flavorOptions}
            products={promoProducts.map(mapProduct)}
          />
        </section>
      )}

      {Array.from(categoriesMap.entries()).map(([slug, items]) => {
        const categoryName = categories.find((c) => c.slug === slug)?.name;

        return (
          <section key={slug} id={slug} className="scroll-mt-24">
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
              {categoryName}
            </h2>
            <ProductGrid flavorOptions={flavorOptions} products={items.map(mapProduct)} />
          </section>
        );
      })}
    </div>
  );
}