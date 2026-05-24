-- CreateEnum
CREATE TYPE "ReplyAuthorType" AS ENUM ('TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('TEACHER', 'STUDENT', 'PARENT', 'ADMIN');

-- AlterTable
ALTER TABLE "teaching_materials" ADD COLUMN     "is_shared" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "discussions" (
    "id" BIGSERIAL NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "rombel_id" BIGINT,
    "subject_id" BIGINT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_replies" (
    "id" BIGSERIAL NOT NULL,
    "discussion_id" BIGINT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_type" "ReplyAuthorType" NOT NULL DEFAULT 'TEACHER',
    "content" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" BIGSERIAL NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_type" "MessageSenderType" NOT NULL DEFAULT 'TEACHER',
    "receiver_id" TEXT NOT NULL,
    "receiver_type" "MessageSenderType" NOT NULL DEFAULT 'TEACHER',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discussions_teacher_id_idx" ON "discussions"("teacher_id");

-- CreateIndex
CREATE INDEX "discussions_rombel_id_idx" ON "discussions"("rombel_id");

-- CreateIndex
CREATE INDEX "discussion_replies_discussion_id_idx" ON "discussion_replies"("discussion_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_receiver_id_idx" ON "messages"("sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "messages_receiver_id_is_read_idx" ON "messages"("receiver_id", "is_read");

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
