import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/ProductDetails"; // Ajuste este caminho se o seu ProductDetails estiver em outra pasta, ex: "@/components/public/ProductDetails"
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // 1. Busca o produto e os adicionais no banco de dados
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { addons: true },
  });

  if (!product) {
    notFound();
  }

  const finalPrice = product.isPromoActive && product.promoPrice 
    ? Number(product.promoPrice) 
    : Number(product.originalPrice);

  // 2. Monta o objeto no formato que o componente ProductDetails espera
  const productData = {
    id: product.id,
    title: product.title,
    originalPrice: finalPrice,
    type: product.type as "SIMPLE" | "PIZZA",
    addons: product.addons.map(addon => ({
      name: addon.name,
      price: Number(addon.price)
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Lado esquerdo: Foto da comida */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-background-surface shadow-md">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Lado direito: Informações e o componente de adicionais */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {product.title}
            </h1>
            <p className="mt-2 text-foreground-muted">
              {product.description}
            </p>
          </div>

          <div className="mt-4 border-t border-border pt-6">
            {/* Aqui entra aquele componente que fizemos no Lote 1 */}
            <ProductDetails product={productData} />
          </div>
        </div>
      </div>
    </div>
  );
}