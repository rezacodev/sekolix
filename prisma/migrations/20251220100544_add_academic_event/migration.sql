-- CreateTable
CREATE TABLE "academic_events" (
    "id" TEXT NOT NULL,
    "tahunAjaranId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_events_tahunAjaranId_idx" ON "academic_events"("tahunAjaranId");

-- AddForeignKey
ALTER TABLE "academic_events" ADD CONSTRAINT "academic_events_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahun_ajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
