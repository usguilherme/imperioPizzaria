import { NextResponse } from "next/server";
import { orderRepository } from "@/modules/order/infrastructure/order.repository";

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  const order = await orderRepository.findStatusByCode(params.code);

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    status: order.status,
    updatedAt: order.updatedAt,
  });
}