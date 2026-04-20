/*
  Warnings:

  - The values [WATCHING] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dateAdded` on the `UserTitle` table. All the data in the column will be lost.
  - You are about to drop the column `isRewatch` on the `UserTitle` table. All the data in the column will be lost.
  - You are about to drop the column `rewatchCount` on the `UserTitle` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED');
ALTER TABLE "UserTitle" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
COMMIT;

-- AlterTable
ALTER TABLE "UserTitle" DROP COLUMN "dateAdded",
DROP COLUMN "isRewatch",
DROP COLUMN "rewatchCount",
ADD COLUMN     "dateStarted" TIMESTAMP(3),
ADD COLUMN     "isRevisit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revisitCount" INTEGER NOT NULL DEFAULT 0;
