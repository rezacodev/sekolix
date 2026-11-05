import { authOptions } from "@/lib/auth";
import { APP_ACTIONS, buildRules, DEFAULT_ACCESS_ROLES, PERMISSION_SUBJECTS } from "@/lib/permissions/definitions";
import type { AppAction, UserRole } from "@/lib/permissions/types";
import { db as prisma } from "@/lib/db";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const USER_ROLES = ["SUPERADMIN", "ADMIN", "GURU", "STAFF", "MURID", "ORANGTUA", "EDITOR", "USER"] as const;
const permissionSubjectSlugs = new Set(PERMISSION_SUBJECTS.map((subject) => subject.slug));

function isKnownSubject(subject: string) {
  return permissionSubjectSlugs.has(subject);
}

function isKnownAction(action: string): action is AppAction {
  return APP_ACTIONS.includes(action as AppAction);
}

const legacyRoleSchema = z.enum(USER_ROLES);

const permissionMutationSchema = z
  .object({
    roleId: z.string().min(1).optional(),
    role: legacyRoleSchema.optional(),
    subject: z.string().min(1).refine(isKnownSubject, "Subject tidak terdaftar di permission matrix"),
    action: z.string().min(1).refine(isKnownAction, "Action tidak terdaftar di permission matrix"),
    inverted: z.boolean().default(false),
  })
  .refine((body) => Boolean(body.roleId) !== Boolean(body.role), {
    message: "Isi salah satu: roleId atau role",
    path: ["roleId"],
  });

const deletePermissionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["access", "legacy"]).default("access"),
});

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPERADMIN") return null;
  return session.user;
}

async function requireAdminRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPERADMIN", "ADMIN"].includes(session.user.role)) return null;
  return session.user;
}

async function ensureDefaultAccessRoles() {
  for (const role of DEFAULT_ACCESS_ROLES) {
    const accessRole = await prisma.accessRole.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
        is_system: true,
        is_active: true,
      },
      create: {
        slug: role.slug,
        name: role.name,
        description: role.description,
        is_system: true,
        is_active: true,
      },
    });

    for (const permission of role.permissions) {
      await prisma.accessPermission.upsert({
        where: {
          role_id_subject_action: {
            role_id: accessRole.id,
            subject: permission.subject,
            action: permission.action,
          },
        },
        update: { inverted: permission.inverted ?? false },
        create: {
          role_id: accessRole.id,
          subject: permission.subject,
          action: permission.action,
          inverted: permission.inverted ?? false,
        },
      });
    }
  }
}

// GET /api/admin/settings/permissions?roleId=...
export async function GET(req: Request) {
  const user = await requireAdminRead();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDefaultAccessRoles();

  const url = new URL(req.url);
  const roleId = url.searchParams.get("roleId");
  const legacyRoleRaw = url.searchParams.get("role");
  const parsedLegacyRole = legacyRoleRaw ? legacyRoleSchema.safeParse(legacyRoleRaw) : null;
  if (parsedLegacyRole && !parsedLegacyRole.success) {
    return NextResponse.json({ error: "role tidak valid" }, { status: 400 });
  }
  const legacyRole = parsedLegacyRole?.data ?? null;

  const accessRoles = await prisma.accessRole.findMany({
    where: { is_active: true },
    include: { permissions: { orderBy: [{ subject: "asc" }, { action: "asc" }] } },
    orderBy: [{ is_system: "desc" }, { name: "asc" }],
  });

  const selectedAccessRole = roleId
    ? accessRoles.find((role) => role.id === roleId)
    : accessRoles[0] ?? null;

  const legacyOverrides = legacyRole
    ? await prisma.rolePermission.findMany({
        where: { role: legacyRole },
        orderBy: [{ subject: "asc" }, { action: "asc" }],
      })
    : [];

  const legacyRules = legacyRole ? buildRules(legacyRole, legacyOverrides) : [];

  return NextResponse.json({
    actions: APP_ACTIONS,
    subjects: PERMISSION_SUBJECTS,
    accessRoles,
    selectedAccessRole,
    legacyRole,
    legacyOverrides,
    legacyRules,
  });
}

// POST /api/admin/settings/permissions
// Body for access role permission: { roleId, subject, action, inverted }
// Body for legacy role override: { role, subject, action, inverted }
export async function POST(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsedBody = permissionMutationSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Validation error", details: parsedBody.error.flatten() }, { status: 400 });
  }
  const { roleId, role, subject, action, inverted } = parsedBody.data;

  if (roleId) {
    const before = await prisma.accessPermission.findUnique({
      where: { role_id_subject_action: { role_id: roleId, subject, action } },
    });
    const permission = await prisma.accessPermission.upsert({
      where: { role_id_subject_action: { role_id: roleId, subject, action } },
      create: { role_id: roleId, subject, action, inverted },
      update: { inverted },
    });

    await logActivity({
      actorUserId: user.id,
      actorName: user.name,
      module: "pengaturan.permissions",
      action: before ? "update" : "create",
      entityType: "AccessPermission",
      entityId: permission.id,
      metadata: { roleId, subject, action, inverted },
      request: req,
    });
    await writeAuditTrail({
      actorUserId: user.id,
      entityType: "AccessPermission",
      entityId: permission.id,
      action: before ? "update" : "create",
      before,
      after: permission,
      reason: "Permission matrix update",
    });

    return NextResponse.json(permission, { status: 201 });
  }

  if (!role) {
    return NextResponse.json({ error: "roleId atau role wajib diisi" }, { status: 400 });
  }

  const before = await prisma.rolePermission.findUnique({
    where: { role_subject_action: { role, subject, action } },
  });
  const permission = await prisma.rolePermission.upsert({
    where: { role_subject_action: { role, subject, action } },
    create: { role: role as UserRole, subject, action, inverted },
    update: { inverted },
  });

  await logActivity({
    actorUserId: user.id,
    actorName: user.name,
    module: "pengaturan.permissions",
    action: before ? "update" : "create",
    entityType: "RolePermission",
    entityId: permission.id,
    metadata: { role, subject, action, inverted },
    request: req,
  });
  await writeAuditTrail({
    actorUserId: user.id,
    entityType: "RolePermission",
    entityId: permission.id,
    action: before ? "update" : "create",
    before,
    after: permission,
    reason: "Legacy role permission override",
  });

  return NextResponse.json(permission, { status: 201 });
}

// DELETE /api/admin/settings/permissions
// Body: { id, type?: "access" | "legacy" }
export async function DELETE(req: Request) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsedBody = deletePermissionSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Validation error", details: parsedBody.error.flatten() }, { status: 400 });
  }
  const { id, type } = parsedBody.data;

  const before =
    type === "legacy"
      ? await prisma.rolePermission.findUnique({ where: { id } })
      : await prisma.accessPermission.findUnique({ where: { id } });
  if (!before) {
    return NextResponse.json({ error: "Permission tidak ditemukan" }, { status: 404 });
  }
  if (type === "legacy") {
    await prisma.rolePermission.delete({ where: { id } });
  } else {
    await prisma.accessPermission.delete({ where: { id } });
  }

  await logActivity({
    actorUserId: user.id,
    actorName: user.name,
    module: "pengaturan.permissions",
    action: "delete",
    entityType: type === "legacy" ? "RolePermission" : "AccessPermission",
    entityId: id,
    metadata: before,
    request: req,
  });
  await writeAuditTrail({
    actorUserId: user.id,
    entityType: type === "legacy" ? "RolePermission" : "AccessPermission",
    entityId: id,
    action: "delete",
    before,
    reason: "Permission removed",
  });

  return NextResponse.json({ ok: true });
}
