-- CreateTable
CREATE TABLE "ResumeShare" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeShare_resumeId_key" ON "ResumeShare"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeShare_token_key" ON "ResumeShare"("token");

-- CreateIndex
CREATE INDEX "ResumeShare_token_idx" ON "ResumeShare"("token");

-- AddForeignKey
ALTER TABLE "ResumeShare" ADD CONSTRAINT "ResumeShare_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
