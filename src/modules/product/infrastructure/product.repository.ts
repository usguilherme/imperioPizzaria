import { prisma } from "@/lib/prisma";
import { Prisma, ProductType } from "@prisma/client";

export interface CreateProductInput {
  title: string;
  description: string;
  imageUrl: string;
  type: ProductType;
  servesInfo?: string | null;
  originalPrice: number;
  promoPrice?: number | null;
  isPromoActive: boolean;
  isAvailable: boolean;
  isFlavorEligible: boolean;
  categoryId: string;
  availableSizeIds?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export class ProductRepository {
  async create(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        type: data.type,
        servesInfo: data.servesInfo,
        originalPrice: new Prisma.Decimal(data.originalPrice),
        promoPrice: data.promoPrice ? new Prisma.Decimal(data.promoPrice) : null,
        isPromoActive: data.isPromoActive,
        isAvailable: data.isAvailable,
        isFlavorEligible: data.isFlavorEligible,
        categoryId: data.categoryId,
        availableSizes: {
          connect: data.availableSizeIds?.map((id) => ({ id })) || [],
        },
      },
    });
  }

  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        type: data.type,
        servesInfo: data.servesInfo,
        originalPrice: data.originalPrice ? new Prisma.Decimal(data.originalPrice) : undefined,
        promoPrice: data.promoPrice !== undefined ? (data.promoPrice ? new Prisma.Decimal(data.promoPrice) : null) : undefined,
        isPromoActive: data.isPromoActive,
        isAvailable: data.isAvailable,
        isFlavorEligible: data.isFlavorEligible,
        categoryId: data.categoryId,
        availableSizes: data.availableSizeIds !== undefined ? {
          set: data.availableSizeIds.map((id) => ({ id })),
        } : undefined,
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, availableSizes: true, addons: true },
    });
  }

  async findAll() {
    return prisma.product.findMany({
      include: { category: true, availableSizes: true, addons: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    return prisma.product.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async findAvailableByCategory() {
    return prisma.category.findMany({
      where: { isActive: true, products: { some: { isAvailable: true } } },
      include: {
        products: {
          where: { isAvailable: true },
          include: { availableSizes: true, addons: true },
          orderBy: { title: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async findFlavorEligible() {
    return prisma.product.findMany({
      where: { isFlavorEligible: true, isAvailable: true },
      include: { availableSizes: true },
    });
  }
}

export const productRepository = new ProductRepository();