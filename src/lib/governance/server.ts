import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildRules, can } from "@/lib/permissions/definitions";
import type { AccessPermissionRule, RolePermissionOverride, UserRole } from "@/lib/permissions/types";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
};

export async function getGovernanceContext() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) return null;

  const [roleOverrides, accessAssignments] = await Promise.all([
    db.rolePermission.findMany({ where: { role: user.role } }),
    db.userAccessRole.findMany({
      where: {
        user_id: user.id,
        is_active: true,
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    }),
  ]);

  const accessPermissions: AccessPermissionRule[] = accessAssignments.flatMap((assignment) =>
    (assignment.role?.permissions ?? []).map((permission) => ({
      roleSlug: assignment.role.slug,
      subject: permission.subject,
      action: permission.action,
      inverted: permission.inverted,
    }))
  );

  const accessRoles = accessAssignments.map((assignment) => ({
    id: assignment.role.id,
    slug: assignment.role.slug,
    name: assignment.role.name,
  }));

  const rules = buildRules(
    user.role,
    roleOverrides.map((rule): RolePermissionOverride => ({
      role: rule.role,
      subject: rule.subject,
      action: rule.action,
      inverted: rule.inverted,
    })),
    accessPermissions
  );

  return { session, user, accessRoles, rules };
}

export async function requirePermission(action: string, subject: string) {
  const context = await getGovernanceContext();
  if (!context) return null;
  if (!can(context.rules, action, subject)) return null;
  return context;
}

export function forbidden(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function logActivity(input: {
  actorUserId?: string | null;
  actorName?: string | null;
  module: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: unknown;
  request?: Request;
}) {
  const headers = input.request?.headers;
  await db.activityLog.create({
    data: {
      actor_user_id: input.actorUserId ?? null,
      actor_name: input.actorName ?? null,
      module: input.module,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? undefined,
      ip_address: headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: headers?.get("user-agent") ?? null,
    },
  });
}

function normalizeAuditValue(value: unknown) {
  if (value === undefined) return undefined;
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue) => {
      if (typeof currentValue === "bigint") return currentValue.toString();
      return currentValue;
    })
  );
}

export async function writeAuditTrail(input: {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  metadata?: unknown;
}) {
  await db.auditTrail.create({
    data: {
      actor_user_id: input.actorUserId ?? null,
      entity_type: input.entityType,
      entity_id: input.entityId,
      action: input.action,
      before: normalizeAuditValue(input.before),
      after: normalizeAuditValue(input.after),
      reason: input.reason ?? null,
      metadata: normalizeAuditValue(input.metadata),
    },
  });
}

export async function createApprovalRequest(input: {
  module: string;
  action: string;
  title: string;
  description?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  requestedBy?: string | null;
  requestedByName?: string | null;
  payload?: unknown;
  steps?: Array<{ approverRoleSlug?: string; approverUserId?: string }>;
}) {
  return db.approvalRequest.create({
    data: {
      module: input.module,
      action: input.action,
      title: input.title,
      description: input.description ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      requested_by: input.requestedBy ?? null,
      requested_by_name: input.requestedByName ?? null,
      payload: input.payload ?? undefined,
      steps: {
        create: (input.steps?.length ? input.steps : [{ approverRoleSlug: "KEPALA_SEKOLAH" }]).map(
          (step, index) => ({
            step_order: index + 1,
            approver_role_slug: step.approverRoleSlug ?? null,
            approver_user_id: step.approverUserId ?? null,
          })
        ),
      },
    },
    include: { steps: true },
  });
}
