import Link from "next/link";
import { Printer } from "lucide-react";
import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { formatDateTime } from "@/lib/utils";

export default async function KitchenPage() {
  const orders = await orderRepository.findByStatusGroup();
  const kitchenOrders = orders.filter(
    (o) => o.status === "CONFIRMED" || o.status === "IN_PREPARATION"
  );

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Módulo de Cozinha</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kitchenOrders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col rounded-card border border-border bg-background-surface p-4"
          >
            <span className="text-xs font-bold text-accent">{order.code}</span>
            <p className="mt-1 text-sm font-semibold text-foreground">{order.customerName}</p>
            <p className="text-xs text-foreground-subtle">{formatDateTime(order.createdAt)}</p>
            <p className="mt-1 text-xs text-foreground-muted">{order.items.length} itens</p>

            <Link
              href={`/admin/cozinha/comanda/${order.id}`}
              target="_blank"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Printer size={16} />
              Imprimir comanda
            </Link>
          </div>
        ))}

        {kitchenOrders.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-foreground-subtle">
            Nenhum pedido em preparo no momento.
          </p>
        )}
      </div>
    </div>
  );
}
