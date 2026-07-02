// test-db.ts
import { prisma } from "./src/lib/prisma"; // SEM o .ts no final

async function main() {
  const category = await prisma.category.create({
    data: { name: "Pizzas Salgadas" }
  });

  await prisma.product.create({
    data: {
      name: "Pizza Calabresa",
      price: 59.90,
      categoryId: category.id
    }
  });

  console.log("Produto inserido com sucesso!");
}

main().catch(console.error);