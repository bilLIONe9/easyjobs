/*
  Warnings:

  - You are about to drop the column `taskId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `automationId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `discoveredAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `discoveryStatus` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `matchData` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `matchScore` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `cvData` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Automation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AutomationRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfileResumeDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_taskId_fkey";

-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "Automation" DROP CONSTRAINT "Automation_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Automation" DROP CONSTRAINT "Automation_userId_fkey";

-- DropForeignKey
ALTER TABLE "AutomationRun" DROP CONSTRAINT "AutomationRun_automationId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_automationId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileResumeDraft" DROP CONSTRAINT "ProfileResumeDraft_jobProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_activityTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";

-- DropIndex
DROP INDEX "Activity_taskId_key";

-- DropIndex
DROP INDEX "Job_userId_automationId_idx";

-- DropIndex
DROP INDEX "Job_userId_discoveryStatus_idx";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "taskId";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "automationId",
DROP COLUMN "discoveredAt",
DROP COLUMN "discoveryStatus",
DROP COLUMN "matchData",
DROP COLUMN "matchScore";

-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "cvData";

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "cvData" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "jobProfileId" TEXT,
ALTER COLUMN "profileId" DROP NOT NULL;

-- DropTable
DROP TABLE "ApiKey";

-- DropTable
DROP TABLE "Automation";

-- DropTable
DROP TABLE "AutomationRun";

-- DropTable
DROP TABLE "Note";

-- DropTable
DROP TABLE "ProfileResumeDraft";

-- DropTable
DROP TABLE "Task";

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
