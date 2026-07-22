import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: {
          notIn: [
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.DELIVERED,
            OrderStatus.CANCELED
          ]
        }
      },
      include: {
        items: {
          include: {
            // 🔧 FIX: antes era "product: true" (trazia TUDO, incluindo
            // imageUrl em base64). A Cozinha só usa o título — então
            // selecionamos só o que é realmente exibido no cupom.
            product: {
              select: { id: true, title: true },
            },
            addons: true,
            pizzaCombination: {
              include: {
                size: true,
                crust: true,
                // 🔧 FIX: mesma coisa aqui — sabores só precisam do nome.
                flavorOne: {
                  select: { id: true, title: true },
                },
                flavorTwo: {
                  select: { id: true, title: true },
                },
              }
            }
          }
        }
      },
      orderBy: { createdAt: "asc" },
    });

    const formattedOrders = pendingOrders.map((order: any) => ({
      ...order,
      items: order.items.map((item: any) => {
        const combo = item.pizzaCombination;
        return {
          ...item,
          sizeName: combo?.size?.name || null,
          crustName: combo?.crust?.name || null,
          flavors: combo ? [combo.flavorOne, combo.flavorTwo].filter(Boolean) : []
        };
      })
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}