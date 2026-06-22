/*
  Warnings:

  - Made the column `details` on table `JobProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "JobProfile" ALTER COLUMN "details" SET NOT NULL;
