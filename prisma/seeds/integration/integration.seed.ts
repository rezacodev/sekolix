import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import {
  DATA_FIELD_MAPPINGS,
  DATA_VALIDATION_RULES,
  INTEGRATION_PROFILES,
} from "../../../src/lib/data-integration/server";

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function seedIntegrationDemo() {
  console.log("Seeding data integration presets...");

  const savedProfiles = [];
  for (const profile of INTEGRATION_PROFILES) {
    const savedProfile = await prisma.dataIntegrationProfile.upsert({
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
    savedProfiles.push(savedProfile);

    for (const mapping of DATA_FIELD_MAPPINGS.filter((item) => item.profileCode === profile.code)) {
      await prisma.dataFieldMapping.upsert({
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
    const profile = rule.profileCode ? savedProfiles.find((item) => item.code === rule.profileCode) ?? null : null;
    await prisma.dataValidationRule.upsert({
      where: { id: `${profile?.id ?? "global"}:${rule.entity}:${rule.field}:${rule.rule}` },
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

  console.log("Data integration presets seeded");
}
