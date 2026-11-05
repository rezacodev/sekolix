import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { APP_ACTIONS, PERMISSION_SUBJECTS, buildRules, can } from "@/lib/permissions/definitions";

describe("QAH permission guard baseline", () => {
  it("denies sensitive admin modules to a student role", () => {
    const rules = buildRules("MURID");

    assert.equal(can(rules, "read", "pengaturan.permissions"), false);
    assert.equal(can(rules, "export", "penerimaan-siswa"), false);
    assert.equal(can(rules, "update", "akademik.nilai"), false);
  });

  it("allows superadmin to manage protected modules", () => {
    const rules = buildRules("SUPERADMIN");

    assert.equal(can(rules, "manage", "pengaturan.permissions"), true);
    assert.equal(can(rules, "export", "penerimaan-siswa"), true);
  });

  it("keeps permission matrix actions and subjects allowlisted", () => {
    const subjects = new Set(PERMISSION_SUBJECTS.map((subject) => subject.slug));

    assert.equal(APP_ACTIONS.includes("manage"), true);
    assert.equal(APP_ACTIONS.includes("export"), true);
    assert.equal(subjects.has("pengaturan.permissions"), true);
    assert.equal(subjects.has("akademik.nilai"), true);
    assert.equal(subjects.has("unknown.module"), false);
  });
});
