/*
  Warnings:

  - You are about to drop the column `location` on the `JobPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN "location",
ADD COLUMN     "locations" TEXT[] DEFAULT ARRAY[]::TEXT[];
