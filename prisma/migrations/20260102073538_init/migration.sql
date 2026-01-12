-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('pending', 'review', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('TEACHER', 'STAFF', 'OTHER');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('SD', 'SMP', 'SMA', 'SMK');

-- CreateEnum
CREATE TYPE "SchoolLevel" AS ENUM ('SD', 'MI', 'SMP', 'MTS', 'SMA', 'MA', 'SMK');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('TUGAS', 'UTS', 'UAS', 'PRAKTIK', 'ULANGAN_HARIAN');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('GANJIL', 'GENAP');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('VIDEO', 'PDF', 'IMAGE', 'LINK', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

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
CREATE TABLE "peserta_didik" (
    "id" TEXT NOT NULL,
    "registrationCode" TEXT,
    "nik" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "schoolOrigin" TEXT,
    "programChoice" TEXT,
    "programId" TEXT,
    "entryYearId" TEXT,
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
    "deleted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peserta_didik_pkey" PRIMARY KEY ("id")
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
    "deleted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahun_ajaran_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "gtk" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'TEACHER',
    "nip" TEXT,
    "niy" TEXT,
    "nuptk" TEXT,
    "nik" TEXT,
    "statusKepegawaian" TEXT,
    "nrg" TEXT,
    "masaKerja" INTEGER,
    "mkg" INTEGER,
    "position" TEXT,
    "department" TEXT,
    "placeOfBirth" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "religion" TEXT,
    "maritalStatus" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "photo" TEXT,
    "image" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "educationHistory" JSONB,
    "academicDegree" TEXT,
    "educatorCertification" JSONB,
    "trainingHistory" JSONB,
    "subjects" JSONB,
    "workloadHours" INTEGER,
    "extraDuties" JSONB,
    "gtkPosition" TEXT,
    "jenisPTK" TEXT,
    "jabatanPTK" TEXT,
    "professionalAllowanceStatus" TEXT,
    "familyInfo" JSONB,
    "bio" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gtk_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "landing_school_identity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "schoolLevel" "SchoolLevel" NOT NULL DEFAULT 'SD',
    "npsn" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "logoDarkUrl" TEXT,
    "faviconUrl" TEXT,
    "coverImageUrl" TEXT,
    "headmaster" TEXT,
    "headmasterNIP" TEXT,
    "accreditation" TEXT,
    "establishedYear" INTEGER,
    "timezone" TEXT DEFAULT 'Asia/Jakarta',
    "language" TEXT DEFAULT 'id',
    "metaDescription" TEXT,
    "socialLinks" JSONB,
    "defaultTheme" TEXT,
    "settings" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_school_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculums" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT,
    "curriculum_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "is_practice" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_groups" (
    "id" BIGSERIAL NOT NULL,
    "class_id" BIGINT NOT NULL,
    "program_id" TEXT NOT NULL,
    "tahunAjaranId" TEXT,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "student_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subjects" (
    "id" BIGSERIAL NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_schedules" (
    "id" BIGSERIAL NOT NULL,
    "class_id" BIGINT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "room" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" BIGSERIAL NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "max_score" DECIMAL(65,30) DEFAULT 100,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" BIGSERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "assessment_id" BIGINT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cards" (
    "id" BIGSERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "average_score" DECIMAL(65,30),
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_classes" (
    "id" BIGSERIAL NOT NULL,
    "class_id" BIGINT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_materials" (
    "id" BIGSERIAL NOT NULL,
    "online_class_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "type" "MaterialType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" BIGSERIAL NOT NULL,
    "online_class_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "max_score" DECIMAL(65,30) DEFAULT 100,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_banks" (
    "id" BIGSERIAL NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" JSONB,
    "answer" TEXT NOT NULL,
    "difficulty" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" BIGSERIAL NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "passing_score" DECIMAL(65,30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "id" BIGSERIAL NOT NULL,
    "exam_id" BIGINT NOT NULL,
    "student_id" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "answers" JSONB,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_batches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fromYearId" TEXT NOT NULL,
    "toYearId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fromClassId" BIGINT,
    "toClassId" BIGINT NOT NULL,
    "fromGroupId" BIGINT,
    "toGroupId" BIGINT,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PesertaDidikToRombel" (
    "A" TEXT NOT NULL,
    "B" BIGINT NOT NULL
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
CREATE UNIQUE INDEX "peserta_didik_registrationCode_key" ON "peserta_didik"("registrationCode");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_didik_nik_key" ON "peserta_didik"("nik");

-- CreateIndex
CREATE INDEX "peserta_didik_programId_idx" ON "peserta_didik"("programId");

-- CreateIndex
CREATE INDEX "peserta_didik_entryYearId_idx" ON "peserta_didik"("entryYearId");

-- CreateIndex
CREATE UNIQUE INDEX "admission_registration_code_settings_tahunAjaranId_key" ON "admission_registration_code_settings"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "admission_registration_code_settings_tahunAjaranId_idx" ON "admission_registration_code_settings"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "tahun_ajaran_isActive_idx" ON "tahun_ajaran"("isActive");

-- CreateIndex
CREATE INDEX "academic_events_tahunAjaranId_idx" ON "academic_events"("tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "gtk_nip_key" ON "gtk"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "gtk_email_key" ON "gtk"("email");

-- CreateIndex
CREATE INDEX "gtk_userId_idx" ON "gtk"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "landing_theme_configs_themeId_key" ON "landing_theme_configs"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "landing_media_publicId_key" ON "landing_media"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "curriculums_code_key" ON "curriculums"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subjects_teacher_id_subject_id_class_id_key" ON "teacher_subjects"("teacher_id", "subject_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "grades_student_id_assessment_id_key" ON "grades"("student_id", "assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_student_id_academic_year_id_semester_key" ON "report_cards"("student_id", "academic_year_id", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_exam_id_student_id_key" ON "exam_results"("exam_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "_PesertaDidikToRombel_AB_unique" ON "_PesertaDidikToRombel"("A", "B");

-- CreateIndex
CREATE INDEX "_PesertaDidikToRombel_B_index" ON "_PesertaDidikToRombel"("B");

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
ALTER TABLE "peserta_didik" ADD CONSTRAINT "peserta_didik_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_didik" ADD CONSTRAINT "peserta_didik_entryYearId_fkey" FOREIGN KEY ("entryYearId") REFERENCES "tahun_ajaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantPayment" ADD CONSTRAINT "ApplicantPayment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantValidation" ADD CONSTRAINT "ApplicantValidation_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_registration_code_settings" ADD CONSTRAINT "admission_registration_code_settings_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahun_ajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_events" ADD CONSTRAINT "academic_events_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahun_ajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gtk" ADD CONSTRAINT "gtk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curriculums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahun_ajaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_classes" ADD CONSTRAINT "online_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_classes" ADD CONSTRAINT "online_classes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_materials" ADD CONSTRAINT "learning_materials_online_class_id_fkey" FOREIGN KEY ("online_class_id") REFERENCES "online_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_online_class_id_fkey" FOREIGN KEY ("online_class_id") REFERENCES "online_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_batches" ADD CONSTRAINT "transfer_batches_fromYearId_fkey" FOREIGN KEY ("fromYearId") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_batches" ADD CONSTRAINT "transfer_batches_toYearId_fkey" FOREIGN KEY ("toYearId") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "transfer_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "peserta_didik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_fromClassId_fkey" FOREIGN KEY ("fromClassId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_toClassId_fkey" FOREIGN KEY ("toClassId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_fromGroupId_fkey" FOREIGN KEY ("fromGroupId") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_toGroupId_fkey" FOREIGN KEY ("toGroupId") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PesertaDidikToRombel" ADD CONSTRAINT "_PesertaDidikToRombel_A_fkey" FOREIGN KEY ("A") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PesertaDidikToRombel" ADD CONSTRAINT "_PesertaDidikToRombel_B_fkey" FOREIGN KEY ("B") REFERENCES "class_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
