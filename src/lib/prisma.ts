import { PrismaClient } from "@prisma/client";

// Evita instanciar múltiplos PrismaClient durante hot-reload em desenvolvimento.
// Equivalente ao padrão Singleton que você já usa no Java (ex: EntityManagerFactory).

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
