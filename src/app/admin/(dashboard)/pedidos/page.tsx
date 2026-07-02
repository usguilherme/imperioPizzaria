import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { OrderKanbanBoard } from "@/components/admin/OrderKanbanBoard";
import { KanbanOrder } from "@/components/admin/OrderKanbanColumn";

export default async function AdminOrdersPage() {
  const orders = await orderRepository.findByStatusGroup();

  const initialOrders: KanbanOrder[] = orders.map((o) => ({
    id: o.id,
    code: o.code,
    customerName: o.customerName,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    itemsCount: o.items.length,
  }));

  return <OrderKanbanBoard initialOrders={initialOrders} />;
}
