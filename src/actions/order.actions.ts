"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function createOrderAction(items: any[], total: number, address: string) {
  try {
    const order = await prisma.order.create({
      data: {
        total,
        address, // Salva o endereço recebido
        items: {
          create: items.map(item => ({
            quantity: item.quantidade,
            price: item.preco,
            productId: item.id
          }))
        }
      }
    });

    revalidatePath('/admin');
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    return { success: false };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    revalidatePath('/admin/pedidos');
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false };
  }
}