import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { OrderKanbanColumn, KanbanOrder } from "./components/OrderKanbanColumn";

export default async function PedidosPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedOrders: KanbanOrder[] = orders.map((o) => ({
    id: o.id,
    code: o.code,
    customerName: o.customerName,
    customerPhone: o.customerPhone ?? undefined,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    itemsCount: o.items.length,
  }));

  return (
    <div className="flex gap-4 p-6 overflow-x-auto">
      {/* Colunas do seu Kanban */}
      <OrderKanbanColumn 
        title="Pendentes" 
        status={OrderStatus.PENDING} 
        orders={formattedOrders.filter((o) => o.status === OrderStatus.PENDING)}
        nextStatus={OrderStatus.CONFIRMED}
        nextLabel="Confirmar"
        accentColor="bg-yellow-500"
      />
      <OrderKanbanColumn 
        title="Confirmados" 
        status={OrderStatus.CONFIRMED} 
        orders={formattedOrders.filter((o) => o.status === OrderStatus.CONFIRMED)}
        nextStatus={OrderStatus.IN_PREPARATION}
        nextLabel="Preparar"
        accentColor="bg-orange-500"
      />
      <OrderKanbanColumn 
        title="Em Preparo" 
        status={OrderStatus.IN_PREPARATION} 
        orders={formattedOrders.filter((o) => o.status === OrderStatus.IN_PREPARATION)}
        nextStatus={OrderStatus.READY}
        nextLabel="Pronto"
        accentColor="bg-blue-500"
      />
      <OrderKanbanColumn 
        title="Pronto" 
        status={OrderStatus.READY} 
        orders={formattedOrders.filter((o) => o.status === OrderStatus.READY)}
        nextStatus={OrderStatus.OUT_FOR_DELIVERY}
        nextLabel="Saiu p/ Entrega"
        accentColor="bg-purple-500"
      />
      <OrderKanbanColumn 
        title="Saiu p/ Entrega" 
        status={OrderStatus.OUT_FOR_DELIVERY} 
        orders={formattedOrders.filter((o) => o.status === OrderStatus.OUT_FOR_DELIVERY)}
        nextStatus={OrderStatus.DELIVERED}
        nextLabel="Entregue"
        accentColor="bg-green-500"
      />
    </div>
  );
}