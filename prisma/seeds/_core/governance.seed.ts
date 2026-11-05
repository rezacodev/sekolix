import { prisma } from "../utils/prisma";
import { DEFAULT_ACCESS_ROLES } from "../../../src/lib/permissions/definitions";

export async function seedGovernanceFoundation() {
  console.log("Seeding governance foundation...");

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

  await prisma.activityLog.create({
    data: {
      actor_user_id: "system",
      actor_name: "System",
      module: "governance",
      action: "seed",
      entity_type: "AccessRole",
      metadata: {
        roles: DEFAULT_ACCESS_ROLES.map((role) => role.slug),
      },
    },
  });

  console.log(`Governance foundation seeded: ${DEFAULT_ACCESS_ROLES.length} access roles`);
}
