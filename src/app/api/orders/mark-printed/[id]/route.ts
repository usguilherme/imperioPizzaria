import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  
  await prisma.order.update({
    where: { id },
    data: { isPrinted: true },
  });

  return NextResponse.json({ success: true });
}