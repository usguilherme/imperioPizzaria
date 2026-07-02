import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";

interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observation?: string | null;
  pizzaFlavors?: {
    flavorOneId: string;
    flavorTwoId?: string | null;
  } | null;
}

interface CreateOrderInput {
  code: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  addressComplement?: string | null;
  paymentMethod: Prisma.OrderCreateInput["paymentMethod"];
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string | null;
  attendantId?: string | null;
  items: OrderItemInput[];
}

export class OrderRepository {
  async create(input: CreateOrderInput) {
    // Transação: garante atomicidade — se falhar em criar qualquer item,
    // o pedido inteiro é revertido (equivalente ao @Transactional do Spring).
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          code: input.code,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryAddress: input.deliveryAddress,
          addressComplement: input.addressComplement,
          paymentMethod: input.paymentMethod,
          subtotal: new Prisma.Decimal(input.subtotal),
          deliveryFee: new Prisma.Decimal(input.deliveryFee),
          total: new Prisma.Decimal(input.total),
          notes: input.notes,
          attendantId: input.attendantId ?? undefined,
        },
      });

      for (const item of input.items) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalPrice: new Prisma.Decimal(item.totalPrice),
            observation: item.observation,
          },
        });

        if (item.pizzaFlavors) {
          await tx.pizzaFlavorCombination.create({
            data: {
              orderItemId: orderItem.id,
              flavorOneId: item.pizzaFlavors.flavorOneId,
              flavorTwoId: item.pizzaFlavors.flavorTwoId ?? null,
            },
          });
        }
      }

      return order;
    });
  }

  async findAll() {
    return prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByStatusGroup() {
    // usado pelo Kanban: busca tudo de uma vez e agrupa em memória
    return prisma.order.findMany({
      where: { status: { not: OrderStatus.DELIVERED } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            pizzaCombination: {
              include: { flavorOne: true, flavorTwo: true },
            },
          },
        },
        attendant: true,
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({ where: { id }, data: { status } });
  }
}

export const orderRepository = new OrderRepository();
