-- DropForeignKey
ALTER TABLE "ApplicantPayment" DROP CONSTRAINT "ApplicantPayment_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicantValidation" DROP CONSTRAINT "ApplicantValidation_applicantId_fkey";

-- AddForeignKey
ALTER TABLE "ApplicantPayment" ADD CONSTRAINT "ApplicantPayment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantValidation" ADD CONSTRAINT "ApplicantValidation_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
