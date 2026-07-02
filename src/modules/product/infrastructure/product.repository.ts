import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateProductDTO, UpdateProductDTO } from "../domain/dtos/product.dto";

/**
 * Camada de acesso a dados do Produto.
 * Isola o Prisma do restante da aplicação — se um dia trocar de ORM,
 * só esta classe muda (mesmo princípio de Repository do Spring Data).
 */
export class ProductRepository {
  async findAll() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAvailableByCategory(categorySlug?: string) {
    return prisma.product.findMany({
      where: {
        isAvailable: true,
        category: categorySlug ? { slug: categorySlug } : undefined,
      },
      include: { category: true },
      orderBy: { title: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  /** Lista produtos elegíveis a compor sabores de pizza (usado no PizzaBuilderModal). */
  async findFlavorEligible() {
    return prisma.product.findMany({
      where: { isFlavorEligible: true, isAvailable: true },
      orderBy: { title: "asc" },
    });
  }

  async create(data: CreateProductDTO) {
    return prisma.product.create({
      data: {
        ...data,
        originalPrice: new Prisma.Decimal(data.originalPrice),
        promoPrice: data.promoPrice != null ? new Prisma.Decimal(data.promoPrice) : null,
      },
    });
  }

  async update(id: string, data: UpdateProductDTO) {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        originalPrice: data.originalPrice != null ? new Prisma.Decimal(data.originalPrice) : undefined,
        promoPrice:
          data.promoPrice !== undefined
            ? data.promoPrice != null
              ? new Prisma.Decimal(data.promoPrice)
              : null
            : undefined,
      },
    });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    return prisma.product.update({ where: { id }, data: { isAvailable } });
  }
}

export const productRepository = new ProductRepository();
