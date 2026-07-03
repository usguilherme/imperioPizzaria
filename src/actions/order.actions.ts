"use server";

import { PrismaClient, PaymentMethod, OrderStatus } from "@prisma/client";
import { CartItem } from "@/store/cart.store";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

interface CheckoutData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  addressComplement?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  deliveryFee: number;
}

export async function createOrderAction(checkoutData: CheckoutData, cartItems: CartItem[]) {
  try {
    // 1. Validar e recalcular preços pelo servidor
    let subtotal = 0;
    // Removida a constante local para usar o valor que vem do checkoutData
    const deliveryFee = checkoutData.deliveryFee; 

    const processedItems = await Promise.all(
      cartItems.map(async (item) => {
        let finalUnitPrice = 0;

        // Se for pizza, o preço base vem da tabela de Tamanhos
        if (item.sizeId) {
          const size = await prisma.pizzaSize.findUnique({ where: { id: item.sizeId } });
          if (!size) throw new Error("Tamanho de pizza inválido");
          finalUnitPrice = Number(size.price);
        } else {
          // Se for produto comum, pega o preço da tabela de Produtos
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error("Produto inválido");
          finalUnitPrice = Number(product.promoPrice || product.originalPrice);
        }

        const itemTotal = finalUnitPrice * item.quantity;
        subtotal += itemTotal;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: finalUnitPrice,
          totalPrice: itemTotal,
          sizeId: item.sizeId,
          flavors: item.flavors,
        };
      })
    );

    const total = subtotal + deliveryFee;

    // 2. Gerar código único para o pedido
    const orderCode = `PED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 3. Salvar no banco usando transação
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          code: orderCode,
          customerName: checkoutData.customerName,
          customerPhone: checkoutData.customerPhone,
          deliveryAddress: checkoutData.deliveryAddress,
          addressComplement: checkoutData.addressComplement,
          paymentMethod: checkoutData.paymentMethod,
          notes: checkoutData.notes,
          subtotal,
          deliveryFee,
          total,
        },
      });

      // Cria os itens e suas combinações de sabores
      for (const item of processedItems) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });

        if (item.sizeId && item.flavors && item.flavors.length > 0) {
          const flavorOne = item.flavors[0];
          const flavorTwo = item.flavors[1];

          if (flavorOne) {
            await tx.pizzaFlavorCombination.create({
              data: {
                orderItemId: orderItem.id,
                sizeId: item.sizeId,
                flavorOneId: flavorOne.id,
                flavorTwoId: flavorTwo ? flavorTwo.id : null,
              },
            });
          }
        }
      }

      return newOrder;
    });

    return { success: true, orderId: order.id, code: order.code };
    
  } catch (error) {
    console.error("Erro ao processar pedido:", error);
    return { success: false, error: "Falha ao finalizar pedido." };
  }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/admin/pedidos"); 
    revalidatePath("/admin"); 

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return { success: false, error: "Falha ao atualizar status." };
  }
}