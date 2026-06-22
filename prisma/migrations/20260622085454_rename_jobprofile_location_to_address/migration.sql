/*
  Warnings:

  - You are about to drop the column `location` on the `JobProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobProfile" DROP COLUMN "location",
ADD COLUMN     "address" TEXT;
