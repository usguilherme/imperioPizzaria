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
          include: { 
            product: true,
            addons: true, // Pegamos os adicionais direto, sem erro!
            pizzaCombination: { // Entramos na relação da pizza para pegar os detalhes
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
    
    // MÁGICA AQUI: Vamos formatar os dados para bater exatamente com o que 
    // o seu frontend da cozinha já está esperando para imprimir.
    const formattedOrders = pendingOrders.map(order => ({
      ...order,
      items: order.items.map(item => {
        const combo = item.pizzaCombination;
        return {
          ...item,
          // Se for pizza, puxamos os nomes de dentro do combo para a raiz do item
          sizeName: combo?.size?.name || null,
          crustName: combo?.crust?.name || null,
          // Juntamos os sabores em um array só, tirando os vazios
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