import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Define o início do dia (00:00:00)

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: today, // Pega todos a partir da meia-noite de hoje
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}