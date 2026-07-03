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
    let subtotal = 0;
    const deliveryFee = checkoutData.deliveryFee; 

    const processedItems = await Promise.all(
      cartItems.map(async (item) => {
        let basePrice = 0;

        if (item.sizeId) {
          const size = await prisma.pizzaSize.findUnique({ where: { id: item.sizeId } });
          if (!size) throw new Error("Tamanho de pizza inválido");
          basePrice = Number(size.price);
        } else {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error("Produto inválido");
          basePrice = Number(product.promoPrice || product.originalPrice);
        }

        const addonsPrice = item.selectedAddons?.reduce((acc, a) => acc + a.price, 0) || 0;
        const finalUnitPrice = basePrice + addonsPrice;
        const itemTotal = finalUnitPrice * item.quantity;
        
        subtotal += itemTotal;

        return {
          ...item,
          unitPrice: finalUnitPrice,
          totalPrice: itemTotal,
          addonsPrice,
        };
      })
    );

    const total = subtotal + deliveryFee;
    const orderCode = `PED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

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

        if (item.selectedAddons && item.selectedAddons.length > 0) {
          for (const addon of item.selectedAddons) {
            await tx.orderItemAddon.create({
              data: {
                orderItemId: orderItem.id,
                name: addon.name,
                price: addon.price
              }
            });
          }
        }

        // Lógica de sabores de pizza com tipagem blindada
        if (item.sizeId && item.flavors && item.flavors.length > 0) {
          const flavorOne = item.flavors[0];
          const flavorTwo = item.flavors[1];
          
          // Checagem explícita para o TypeScript entender que o objeto e o ID existem
          if (flavorOne && flavorOne.id) {
            await tx.pizzaFlavorCombination.create({
              data: {
                orderItemId: orderItem.id,
                sizeId: item.sizeId,
                flavorOneId: flavorOne.id,
                flavorTwoId: (flavorTwo && flavorTwo.id) ? flavorTwo.id : null,
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
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/pedidos");
  return { success: true };
}

export async function deleteOrderAction(orderId: string) {
  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/admin/pedidos");
  return { success: true };
}