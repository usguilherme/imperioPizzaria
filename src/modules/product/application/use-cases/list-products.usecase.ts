import { prisma } from "@/lib/prisma";

export class ListProductsUseCase {
  async execute() {
    return await prisma.product.findMany({
      include: {
        category: true,
        flavors: true
      }
    });
  }
}