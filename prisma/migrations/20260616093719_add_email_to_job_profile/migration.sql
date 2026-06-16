/*
  Warnings:

  - Added the required column `email` to the `JobProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobProfile" ADD COLUMN "email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "JobProfile" ALTER COLUMN "email" DROP DEFAULT;
