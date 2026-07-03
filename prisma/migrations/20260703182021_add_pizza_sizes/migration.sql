/*
  Warnings:

  - Added the required column `sizeId` to the `pizza_flavor_combinations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pizza_flavor_combinations" ADD COLUMN     "sizeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "pizza_sizes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "maxFlavors" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pizza_sizes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pizza_flavor_combinations" ADD CONSTRAINT "pizza_flavor_combinations_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "pizza_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
