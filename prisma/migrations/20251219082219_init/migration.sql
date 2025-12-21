-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('pending', 'review', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "adminTheme" TEXT NOT NULL DEFAULT 'classic-light',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "landing_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "image" TEXT,
    "featuredImage" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author" TEXT,
    "readTime" INTEGER,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "landing_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "image" TEXT,
    "category" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "landing_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "image" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_albums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_galleries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "albumId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_sections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "body" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "registrationCode" TEXT,
    "nik" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "schoolOrigin" TEXT,
    "programChoice" TEXT,
    "programId" TEXT,
    "academicYearId" TEXT,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'pending',
    "submissionData" JSONB,
    "notes" TEXT,
    "handledBy" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT,
    "nisn" TEXT,
    "noKK" TEXT,
    "placeOfBirth" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "religion" TEXT,
    "motherTongue" TEXT,
    "address" TEXT,
    "village" TEXT,
    "district" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "fatherName" TEXT,
    "fatherNik" TEXT,
    "fatherBirthYear" INTEGER,
    "fatherEducation" TEXT,
    "fatherOccupation" TEXT,
    "fatherIncome" TEXT,
    "motherName" TEXT,
    "motherNik" TEXT,
    "motherBirthYear" INTEGER,
    "motherEducation" TEXT,
    "motherOccupation" TEXT,
    "motherIncome" TEXT,
    "guardianName" TEXT,
    "guardianNik" TEXT,
    "guardianBirthYear" INTEGER,
    "guardianEducation" TEXT,
    "guardianOccupation" TEXT,
    "guardianIncome" TEXT,
    "mobile" TEXT,
    "livesWith" TEXT,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "distanceToSchool" DOUBLE PRECISION,
    "transportationMode" TEXT,
    "anakKe" INTEGER,
    "jumlahSaudara" INTEGER,
    "achievements" TEXT,
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

-- CreateTable
CREATE TABLE "admission_landing_settings" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroDescription" TEXT,
    "isApplyFormEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_landing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_registration_code_settings" (
    "id" TEXT NOT NULL,
    "tahunAjaranId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'DAFTAR',
    "suffix" TEXT NOT NULL DEFAULT '',
    "padLength" INTEGER NOT NULL DEFAULT 4,
    "includeYearCode" BOOLEAN NOT NULL DEFAULT true,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_registration_code_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahun_ajaran" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "yearCode" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "registrationFee" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahun_ajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "image" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_theme_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "primaryColor" TEXT NOT NULL DEFAULT '#001f3f',
    "secondaryColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "accentColor" TEXT NOT NULL DEFAULT '#FFD700',
    "textColor" TEXT NOT NULL DEFAULT '#1f2937',
    "borderColor" TEXT NOT NULL DEFAULT '#e5e7eb',
    "grayColor" TEXT NOT NULL DEFAULT '#6b7280',
    "headingFont" TEXT NOT NULL DEFAULT '''Playfair Display'', serif',
    "bodyFont" TEXT NOT NULL DEFAULT 'Inter, sans-serif',
    "logoUrl" TEXT,
    "customLogoUrl" TEXT,
    "defaultPrimaryColor" TEXT NOT NULL DEFAULT '#001f3f',
    "defaultSecondaryColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "defaultAccentColor" TEXT NOT NULL DEFAULT '#FFD700',
    "defaultTextColor" TEXT NOT NULL DEFAULT '#1f2937',
    "defaultBorderColor" TEXT NOT NULL DEFAULT '#e5e7eb',
    "defaultGrayColor" TEXT NOT NULL DEFAULT '#6b7280',
    "defaultHeadingFont" TEXT NOT NULL DEFAULT '''Playfair Display'', serif',
    "defaultBodyFont" TEXT NOT NULL DEFAULT 'Inter, sans-serif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_theme_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_media" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "folder" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_slug_key" ON "landing_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "landing_articles_slug_key" ON "landing_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "landing_news_slug_key" ON "landing_news"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "landing_events_slug_key" ON "landing_events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "landing_albums_name_key" ON "landing_albums"("name");

-- CreateIndex
CREATE INDEX "landing_galleries_albumId_idx" ON "landing_galleries"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "landing_sections_slug_key" ON "landing_sections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_registrationCode_key" ON "Applicant"("registrationCode");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_nik_key" ON "Applicant"("nik");

-- CreateIndex
CREATE INDEX "Applicant_programId_idx" ON "Applicant"("programId");

-- CreateIndex
CREATE INDEX "Applicant_academicYearId_idx" ON "Applicant"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "admission_registration_code_settings_tahunAjaranId_key" ON "admission_registration_code_settings"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "admission_registration_code_settings_tahunAjaranId_idx" ON "admission_registration_code_settings"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "tahun_ajaran_isActive_idx" ON "tahun_ajaran"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "landing_theme_configs_themeId_key" ON "landing_theme_configs"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "landing_media_publicId_key" ON "landing_media"("publicId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_galleries" ADD CONSTRAINT "landing_galleries_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "landing_albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "tahun_ajaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantPayment" ADD CONSTRAINT "ApplicantPayment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantValidation" ADD CONSTRAINT "ApplicantValidation_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_registration_code_settings" ADD CONSTRAINT "admission_registration_code_settings_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahun_ajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
