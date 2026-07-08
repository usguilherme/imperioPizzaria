import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  // Buscamos categorias, tamanhos e agora as BORDAS no banco
  const [categories, sizes, crusts] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.pizzaSize.findMany({ where: { isActive: true } }),
    prisma.pizzaCrust.findMany({ where: { isActive: true } }) 
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Novo produto</h1>
      <ProductForm
        categories={categories}
        // Mapeamos para enviar só id e nome, evitando erros do tipo Decimal
        availableSizes={sizes.map(size => ({ id: size.id, name: size.name }))}
        // Passamos as bordas exigidas pelo TypeScript
        availableCrusts={crusts.map(crust => ({ id: crust.id, name: crust.name }))}
      />
    </div>
  );
}