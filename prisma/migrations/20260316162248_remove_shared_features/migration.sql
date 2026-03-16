/*
  Warnings:

  - You are about to drop the `SharedFranchise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SharedTitle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SharedFranchise" DROP CONSTRAINT "SharedFranchise_franchiseId_fkey";

-- DropForeignKey
ALTER TABLE "SharedFranchise" DROP CONSTRAINT "SharedFranchise_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "SharedFranchise" DROP CONSTRAINT "SharedFranchise_sharerId_fkey";

-- DropForeignKey
ALTER TABLE "SharedTitle" DROP CONSTRAINT "SharedTitle_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "SharedTitle" DROP CONSTRAINT "SharedTitle_sharerId_fkey";

-- DropForeignKey
ALTER TABLE "SharedTitle" DROP CONSTRAINT "SharedTitle_titleId_fkey";

-- DropTable
DROP TABLE "SharedFranchise";

-- DropTable
DROP TABLE "SharedTitle";

-- DropEnum
DROP TYPE "ShareStatus";
