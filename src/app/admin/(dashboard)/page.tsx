import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { productRepository } from "@/modules/product/infrastructure/product.repository";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([
    orderRepository.findAll(),
    productRepository.findAll(),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ordersToday = orders.filter((o) => new Date(o.createdAt) >= today);
  const revenueToday = ordersToday.reduce((sum, o) => sum + Number(o.total), 0);
  const activeOrders = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELED");

  const cards = [
    { label: "Pedidos hoje", value: ordersToday.length.toString() },
    { label: "Faturamento hoje", value: formatCurrency(revenueToday) },
    { label: "Pedidos em aberto", value: activeOrders.length.toString() },
    { label: "Produtos cadastrados", value: products.length.toString() },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-card border border-border bg-background-surface p-5"
          >
            <p className="text-sm text-foreground-subtle">{card.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-primary">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
