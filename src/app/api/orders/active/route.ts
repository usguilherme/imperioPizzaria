import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/auth.config";
import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { KanbanOrder } from "@/components/admin/OrderKanbanColumn";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const orders = await orderRepository.findByStatusGroup();

  const payload: KanbanOrder[] = orders.map((o) => ({
    id: o.id,
    code: o.code,
    customerName: o.customerName,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    itemsCount: o.items.length,
  }));

  return NextResponse.json(payload);
}
