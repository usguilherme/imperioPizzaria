import { PrismaClient, ProductType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin inicial
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@imperio.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "troque-esta-senha";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador Império",
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Categorias
  const [pizzas, hamburgueres, combos] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "pizzas" },
      update: {},
      create: { name: "Pizzas", slug: "pizzas", order: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "hamburgueres" },
      update: {},
      create: { name: "Hambúrgueres", slug: "hamburgueres", order: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "combos" },
      update: {},
      create: { name: "Combos", slug: "combos", order: 3 },
    }),
  ]);

  // Produtos - pizzas elegíveis a montagem 2 sabores
  await prisma.product.createMany({
    data: [
      {
        title: "Pizza Calabresa",
        description: "Molho de tomate, calabresa fatiada, cebola e azeitonas.",
        imageUrl: "/images/pizza-calabresa.jpg",
        type: ProductType.PIZZA,
        servesInfo: "Serve 2-3 pessoas",
        originalPrice: 54.9,
        promoPrice: 44.9,
        isPromoActive: true,
        isFlavorEligible: true,
        categoryId: pizzas.id,
      },
      {
        title: "Pizza Portuguesa",
        description: "Presunto, ovos, cebola, azeitona e mussarela.",
        imageUrl: "/images/pizza-portuguesa.jpg",
        type: ProductType.PIZZA,
        servesInfo: "Serve 2-3 pessoas",
        originalPrice: 59.9,
        isFlavorEligible: true,
        categoryId: pizzas.id,
      },
      {
        title: "Império Burger Duplo",
        description: "Dois smash burgers, queijo cheddar, bacon e molho especial da casa.",
        imageUrl: "/images/burger-duplo.jpg",
        type: ProductType.SIMPLE,
        servesInfo: "Serve 1 pessoa",
        originalPrice: 32.9,
        promoPrice: 27.9,
        isPromoActive: true,
        categoryId: hamburgueres.id,
      },
      {
        title: "Combo Coroa (2 Burgers + Batata + Refri)",
        description: "Dois hambúrgueres artesanais, batata frita grande e refrigerante 600ml.",
        imageUrl: "/images/combo-coroa.jpg",
        type: ProductType.SIMPLE,
        servesInfo: "Serve 2 pessoas",
        originalPrice: 79.9,
        promoPrice: 64.9,
        isPromoActive: true,
        categoryId: combos.id,
      },
    ],
  });

  console.log("Seed concluído.");
  console.log(`Admin: ${adminEmail} / senha definida em SEED_ADMIN_PASSWORD`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
