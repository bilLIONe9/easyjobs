-- CreateTable
CREATE TABLE "JobPostTag" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobPostToJobPostTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobPostToJobPostTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobPostTag_value_key" ON "JobPostTag"("value");

-- CreateIndex
CREATE INDEX "_JobPostToJobPostTag_B_index" ON "_JobPostToJobPostTag"("B");

-- AddForeignKey
ALTER TABLE "_JobPostToJobPostTag" ADD CONSTRAINT "_JobPostToJobPostTag_A_fkey" FOREIGN KEY ("A") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobPostToJobPostTag" ADD CONSTRAINT "_JobPostToJobPostTag_B_fkey" FOREIGN KEY ("B") REFERENCES "JobPostTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
