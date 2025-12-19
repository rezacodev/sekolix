-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('pending', 'review', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "nikHash" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "nikMasked" TEXT NOT NULL,
    "phoneMasked" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "schoolOrigin" TEXT,
    "programChoice" TEXT,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'pending',
    "submissionData" JSONB,
    "notes" TEXT,
    "handledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantPayment" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "proofUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantValidation" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "validatorId" TEXT,
    "result" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantValidation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApplicantPayment" ADD CONSTRAINT "ApplicantPayment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantValidation" ADD CONSTRAINT "ApplicantValidation_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
