import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ where: { type: 'PIZZA' } });
  const allCrusts = await prisma.pizzaCrust.findMany();

  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        availableCrusts: {
          set: allCrusts.map(c => ({ id: c.id }))
        }
      }
    });
    console.log(`Conectado todas as bordas na pizza: ${p.title}`);
  }
}

main().finally(() => prisma.$disconnect());