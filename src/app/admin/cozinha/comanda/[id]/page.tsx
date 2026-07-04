import { notFound } from "next/navigation";
import { orderRepository } from "@/modules/order/infrastructure/order.repository";
import { KitchenTicket } from "@/components/admin/KitchenTicket"; // Importação correta

const PAYMENT_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro",
};

interface ComandaPageProps {
  params: Promise<{ id: string }>;
}

// Mantenha apenas esta exportação default
export default async function ComandaPage({ params }: ComandaPageProps) {
  const { id } = await params;
  const order = await orderRepository.findById(id);
  
  if (!order) notFound();

  return (
    <KitchenTicket
      order={{
        code: order.code,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
        notes: order.notes,
        total: Number(order.total),
        items: order.items.map((item) => ({
          quantity: item.quantity,
          productTitle: item.product.title,
          observation: item.observation,
          flavorOne: item.pizzaCombination?.flavorOne.title,
          flavorTwo: item.pizzaCombination?.flavorTwo?.title ?? null,
        })),
      }}
    />
  );
}