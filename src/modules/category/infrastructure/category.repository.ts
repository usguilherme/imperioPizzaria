import { prisma } from "@/lib/prisma";
import { CategorySchemaInput } from "@/modules/category/application/validators/category.schema";

export const categoryRepository = {
  findAll: () =>
    prisma.category.findMany({
      orderBy: { order: "asc" },
    }),

  findById: (id: string) => prisma.category.findUnique({ where: { id } }),

  findBySlug: (slug: string) => prisma.category.findUnique({ where: { slug } }),

  create: (data: CategorySchemaInput) => prisma.category.create({ data }),

  update: (id: string, data: CategorySchemaInput) =>
    prisma.category.update({ where: { id }, data }),

  delete: (id: string) => prisma.category.delete({ where: { id } }),

  toggleActive: (id: string, isActive: boolean) =>
    prisma.category.update({ where: { id }, data: { isActive } }),

  countProducts: (id: string) => prisma.product.count({ where: { categoryId: id } }),
};