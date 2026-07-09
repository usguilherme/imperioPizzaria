import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const crusts = await prisma.pizzaCrust.findMany();
  
  // Mapeamento dos IDs que você me passou
  const sizeMap: Record<string, string> = {
    "M": "cmrcdebs900032w8m3n1bhfsc",
    "G": "cmrcdexa600042w8mwruqloln",
    "F": "cmr5bluka0000fcawl8cjr4wl",
    "B": "cmrcdfdxi00052w8m7wbt0mm6"
  };

  for (const c of crusts) {
    const suffix = c.name.trim().split(" ").pop();
    const sizeId = suffix ? sizeMap[suffix] : null;

    if (sizeId) {
      await prisma.pizzaCrust.update({
        where: { id: c.id },
        data: { sizeId }
      });
      console.log(`Corrigido: ${c.name} -> ${sizeId}`);
    }
  }
}

main().finally(() => prisma.$disconnect());