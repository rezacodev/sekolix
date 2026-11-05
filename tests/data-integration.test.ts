import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getIntegrationTemplateColumns, validateStudentImportRow } from "../src/lib/data-integration/server";

describe("data integration helpers", () => {
  it("validates required national student identifiers", () => {
    const issues = validateStudentImportRow({
      nik: "123",
      nisn: "987",
      fullName: "",
      fatherName: "",
      motherName: "",
    });

    assert.equal(issues.some((issue) => issue.field === "nik" && issue.severity === "ERROR"), true);
    assert.equal(issues.some((issue) => issue.field === "nisn" && issue.severity === "ERROR"), true);
    assert.equal(issues.some((issue) => issue.field === "fullName" && issue.severity === "ERROR"), true);
    assert.equal(issues.some((issue) => issue.field === "parent" && issue.severity === "WARNING"), true);
  });

  it("exposes template columns for every supported export entity", () => {
    for (const entity of ["students", "staff", "rombels", "subjects", "grades"]) {
      const columns = getIntegrationTemplateColumns(entity);

      assert.equal(columns.length > 0, true);
      assert.equal(columns.every((column) => column.key.length > 0 && column.header.length > 0), true);
    }
  });
});
