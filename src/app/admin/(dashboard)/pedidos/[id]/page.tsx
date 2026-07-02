import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface OrderDetailPageProps {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await orderRepository.findById(params.id);
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{order.code}</h1>
          <p className="text-sm text-foreground-subtle">{formatDateTime(order.createdAt)}</p>
        </div>
        <Link
          href={`/admin/cozinha/comanda/${order.id}`}
          target="_blank"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Printer size={16} />
          Imprimir comanda
        </Link>
      </div>

      <div className="mb-4 rounded-card border border-border bg-background-surface p-4">
        <p className="text-sm text-foreground"><strong>Cliente:</strong> {order.customerName}</p>
        <p className="text-sm text-foreground"><strong>Telefone:</strong> {order.customerPhone}</p>
        <p className="text-sm text-foreground"><strong>Endereço:</strong> {order.deliveryAddress}</p>
        <p className="text-sm text-foreground"><strong>Pagamento:</strong> {order.paymentMethod}</p>
        <p className="text-sm text-foreground"><strong>Status:</strong> {order.status}</p>
      </div>

      <div className="rounded-card border border-border bg-background-surface p-4">
        <h2 className="mb-3 font-semibold text-foreground">Itens</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-border pb-2 text-sm">
              <div>
                <p className="text-foreground">
                  {item.quantity}x {item.product.title}
                </p>
                {item.pizzaCombination && (
                  <p className="text-xs text-foreground-subtle">
                    {item.pizzaCombination.flavorOne.title}
                    {item.pizzaCombination.flavorTwo && ` / ${item.pizzaCombination.flavorTwo.title}`}
                  </p>
                )}
                {item.observation && (
                  <p className="text-xs text-foreground-subtle">Obs: {item.observation}</p>
                )}
              </div>
              <span className="text-foreground">{formatCurrency(Number(item.totalPrice))}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between font-display text-lg font-bold text-primary">
          <span>Total</span>
          <span>{formatCurrency(Number(order.total))}</span>
        </div>
      </div>
    </div>
  );
}
