import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";

interface ResolvedAddon {
  name: string;
  price: number;
}

interface ResolvedPizzaSelection {
  sizeId: string;
  flavorOneId: string;
  flavorTwoId?: string | null;
  crustId?: string | null;
}

interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number; // preço unitário base (tamanho OU preço fixo do produto)
  totalPrice: number; // (unitPrice + adicionais + borda) * quantity
  observation?: string | null;
  addons?: ResolvedAddon[];
  pizza?: ResolvedPizzaSelection | null;
}

interface CreateOrderInput {
  code: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  addressComplement?: string | null;
  neighborhood?: string | null;
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
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          code: input.code,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryAddress: input.deliveryAddress,
          addressComplement: input.addressComplement,
          neighborhood: input.neighborhood,
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

        if (item.addons && item.addons.length > 0) {
          await tx.orderItemAddon.createMany({
            data: item.addons.map((addon) => ({
              orderItemId: orderItem.id,
              name: addon.name,
              price: new Prisma.Decimal(addon.price),
            })),
          });
        }

        if (item.pizza) {
          await tx.pizzaFlavorCombination.create({
            data: {
              orderItemId: orderItem.id,
              sizeId: item.pizza.sizeId,
              flavorOneId: item.pizza.flavorOneId,
              flavorTwoId: item.pizza.flavorTwoId ?? null,
              crustId: item.pizza.crustId ?? null,
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
            addons: true,
            pizzaCombination: {
              include: { size: true, crust: true, flavorOne: true, flavorTwo: true },
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

  async markAsPrinted(id: string) {
    return prisma.order.update({ where: { id }, data: { isPrinted: true } });
  }

  // Método adicionado para resolver o erro de build
  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Encontra todos os itens para deletar sub-tabelas (addons e pizzas)
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      
      for (const item of items) {
        await tx.orderItemAddon.deleteMany({ where: { orderItemId: item.id } });
        await tx.pizzaFlavorCombination.deleteMany({ where: { orderItemId: item.id } });
      }

      // 2. Deleta os itens e o pedido
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      return await tx.order.delete({ where: { id } });
    });
  }
}

export const orderRepository = new OrderRepository();