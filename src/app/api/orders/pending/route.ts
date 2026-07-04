import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

// Força o Next.js a sempre executar esta rota no servidor, sem cache
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: { isPrinted: false },
      include: { 
        items: {
          include: { product: true }
        } 
      },
      orderBy: { createdAt: "asc" },
    });
    
    return NextResponse.json(pendingOrders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}