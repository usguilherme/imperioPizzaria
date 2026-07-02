import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listProductsUseCase } from "@/modules/product/application/use-cases/list-products.usecase";
import { deleteProductAction, toggleProductAvailabilityAction } from "@/actions/product.actions";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default async function AdminProductsPage() {
  const products = await listProductsUseCase();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Cardápio</h1>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus size={16} />
          Novo produto
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background-surface text-left text-foreground-subtle">
            <tr>
              <th className="p-3 font-medium">Produto</th>
              <th className="p-3 font-medium">Categoria</th>
              <th className="p-3 font-medium">Preço</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-border bg-background-surface">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-background-elevated">
                      <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                    </div>
                    <span className="font-medium text-foreground">{product.title}</span>
                  </div>
                </td>
                <td className="p-3 text-foreground-muted">{product.categoryName}</td>
                <td className="p-3">
                  {product.isPromoActive && product.promoPrice ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-foreground-subtle line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrency(product.promoPrice)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-foreground">{formatCurrency(product.originalPrice)}</span>
                  )}
                </td>
                <td className="p-3">
                  <form
                    action={async () => {
                      "use server";
                      await toggleProductAvailabilityAction(product.id, !product.isAvailable);
                    }}
                  >
                    <button type="submit">
                      <Badge variant={product.isAvailable ? "success" : "danger"}>
                        {product.isAvailable ? "Disponível" : "Pausado"}
                      </Badge>
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/produtos/${product.id}/editar`}
                      className="text-foreground-muted hover:text-primary"
                    >
                      <Pencil size={16} />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteProductAction(product.id);
                      }}
                    >
                      <button type="submit" className="text-foreground-muted hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="p-8 text-center text-sm text-foreground-subtle">
            Nenhum produto cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
