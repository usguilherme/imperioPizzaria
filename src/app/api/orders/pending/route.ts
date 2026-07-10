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
      // Certifique-se de incluir o campo 'notes' aqui se o Prisma exigir
      // (Por padrão o prisma já traz todos os campos, mas a formatação abaixo pode estar filtrando)
      include: { 
        items: {
          include: { 
            product: true,
            addons: true,
            pizzaCombination: {
              include: {
                size: true,
                crust: true,
                flavorOne: true,
                flavorTwo: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "asc" },
    });
    
    // CORREÇÃO: Certifique-se de manter o 'notes' no spread operator (...)
    const formattedOrders = pendingOrders.map((order: any) => ({
      ...order, // Isso garante que 'notes', 'customerName', etc, continuem aqui
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