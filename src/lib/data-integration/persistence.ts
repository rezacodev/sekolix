import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { DATA_FIELD_MAPPINGS, DATA_VALIDATION_RULES, INTEGRATION_PROFILES } from "./server";

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function ensureDefaultIntegrationProfiles() {
  const profiles = [];

  for (const profile of INTEGRATION_PROFILES) {
    const savedProfile = await db.dataIntegrationProfile.upsert({
      where: { code: profile.code },
      update: {
        name: profile.name,
        description: profile.description,
        target_system: profile.target_system,
        school_level: profile.school_level,
        direction: profile.direction,
        is_active: true,
        settings: asJson(profile.settings),
      },
      create: {
        code: profile.code,
        name: profile.name,
        description: profile.description,
        target_system: profile.target_system,
        school_level: profile.school_level,
        direction: profile.direction,
        settings: asJson(profile.settings),
      },
    });
    profiles.push(savedProfile);

    const mappings = DATA_FIELD_MAPPINGS.filter((mapping) => mapping.profileCode === profile.code);
    for (const mapping of mappings) {
      await db.dataFieldMapping.upsert({
        where: {
          profile_id_entity_internal_field_target_field: {
            profile_id: savedProfile.id,
            entity: mapping.entity,
            internal_field: mapping.internal_field,
            target_field: mapping.target_field,
          },
        },
        update: {
          label: mapping.label,
          required: mapping.required ?? false,
          transform: mapping.transform,
          sort_order: mapping.sort_order,
          notes: mapping.notes,
        },
        create: {
          profile_id: savedProfile.id,
          entity: mapping.entity,
          internal_field: mapping.internal_field,
          target_field: mapping.target_field,
          label: mapping.label,
          required: mapping.required ?? false,
          transform: mapping.transform,
          sort_order: mapping.sort_order,
          notes: mapping.notes,
        },
      });
    }
  }

  for (const rule of DATA_VALIDATION_RULES) {
    const profile = rule.profileCode
      ? profiles.find((candidate) => candidate.code === rule.profileCode) ?? null
      : null;
    await db.dataValidationRule.upsert({
      where: {
        id: `${profile?.id ?? "global"}:${rule.entity}:${rule.field}:${rule.rule}`,
      },
      update: {
        profile_id: profile?.id ?? null,
        severity: rule.severity,
        message: rule.message,
        is_active: true,
      },
      create: {
        id: `${profile?.id ?? "global"}:${rule.entity}:${rule.field}:${rule.rule}`,
        profile_id: profile?.id ?? null,
        entity: rule.entity,
        field: rule.field,
        rule: rule.rule,
        severity: rule.severity,
        message: rule.message,
      },
    });
  }

  return profiles;
}

export async function getDefaultIntegrationProfile() {
  const profile = await db.dataIntegrationProfile.findFirst({
    where: { is_active: true },
    orderBy: [{ target_system: "asc" }, { school_level: "asc" }],
  });
  if (profile) return profile;

  const profiles = await ensureDefaultIntegrationProfiles();
  return profiles[0] ?? null;
}
