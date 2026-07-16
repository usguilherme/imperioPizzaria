import { notFound } from "next/navigation";
import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { OrderStatusTracker } from "@/components/public/OrderStatusTracker";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 0; // sempre busca dados frescos ao entrar na página

interface PageProps {
  params: { codigo: string };
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const order = await orderRepository.findByCode(params.codigo);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Pedido #{order.code}
        </h1>
        <p className="text-sm text-foreground-muted">
          Olá, {order.customerName}! Acompanhe o andamento do seu pedido abaixo.
        </p>
      </div>

      <OrderStatusTracker code={order.code} initialStatus={order.status} />

      <div className="rounded-card border border-border bg-background-surface p-6 space-y-3">
        <h2 className="font-semibold text-foreground">Resumo do pedido</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-foreground-muted">
                {item.quantity}x {item.product.title}
              </span>
              <span className="text-foreground">{formatCurrency(Number(item.totalPrice))}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-3 flex justify-between font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-primary">{formatCurrency(Number(order.total))}</span>
        </div>
      </div>

      <div className="text-sm text-foreground-subtle">
        <p><strong>Endereço:</strong> {order.deliveryAddress}</p>
        {order.neighborhood && <p><strong>Bairro:</strong> {order.neighborhood}</p>}
      </div>
    </div>
  );
}