/*
  Warnings:

  - Added the required column `updatedAt` to the `Franchise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Franchise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Franchise" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Franchise_userId_idx" ON "Franchise"("userId");

-- AddForeignKey
ALTER TABLE "Franchise" ADD CONSTRAINT "Franchise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
