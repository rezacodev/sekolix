-- Governance foundation for dynamic operational roles, audit, and approvals.

-- CreateTable
CREATE TABLE "access_roles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_access_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_by" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_access_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "inverted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_name" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_trails" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requested_by" TEXT,
    "requested_by_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "decided_by" TEXT,
    "decided_at" TIMESTAMP(3),
    "decision_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_steps" (
    "id" TEXT NOT NULL,
    "approval_request_id" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "approver_role_slug" TEXT,
    "approver_user_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decided_by" TEXT,
    "decided_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "access_roles_slug_key" ON "access_roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_access_roles_user_id_role_id_key" ON "user_access_roles"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "user_access_roles_user_id_is_active_idx" ON "user_access_roles"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "user_access_roles_role_id_is_active_idx" ON "user_access_roles"("role_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "access_permissions_role_id_subject_action_key" ON "access_permissions"("role_id", "subject", "action");

-- CreateIndex
CREATE INDEX "access_permissions_subject_action_idx" ON "access_permissions"("subject", "action");

-- CreateIndex
CREATE INDEX "activity_logs_module_action_idx" ON "activity_logs"("module", "action");

-- CreateIndex
CREATE INDEX "activity_logs_actor_user_id_created_at_idx" ON "activity_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_trails_entity_type_entity_id_idx" ON "audit_trails"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_trails_actor_user_id_created_at_idx" ON "audit_trails"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_trails_action_created_at_idx" ON "audit_trails"("action", "created_at");

-- CreateIndex
CREATE INDEX "approval_requests_module_status_idx" ON "approval_requests"("module", "status");

-- CreateIndex
CREATE INDEX "approval_requests_requested_by_created_at_idx" ON "approval_requests"("requested_by", "created_at");

-- CreateIndex
CREATE INDEX "approval_requests_entity_type_entity_id_idx" ON "approval_requests"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "approval_steps_approval_request_id_step_order_key" ON "approval_steps"("approval_request_id", "step_order");

-- CreateIndex
CREATE INDEX "approval_steps_status_step_order_idx" ON "approval_steps"("status", "step_order");

-- AddForeignKey
ALTER TABLE "user_access_roles" ADD CONSTRAINT "user_access_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_access_roles" ADD CONSTRAINT "user_access_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "access_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_permissions" ADD CONSTRAINT "access_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "access_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_approval_request_id_fkey" FOREIGN KEY ("approval_request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
