import { PrismaClient } from '@prisma/client';
import ListaPedidos from '@/components/ListaPedidos';

const prisma = new PrismaClient();

export default async function PedidosAdminPage() {
  // Busca os dados no servidor
  const pedidos = await prisma.order.findMany({
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Passa para o componente que você criou na pasta components/
  return <ListaPedidos initialPedidos={pedidos} />;
}