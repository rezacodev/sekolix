import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NEW_MODULE_DEMO_SEEDS } from "../prisma/seeds/modul-tambahan";

const REQUIRED_NEW_MODULE_CODES = ["GOV", "ORT", "KEU", "BKS", "LIB", "INV", "SDM", "TU", "EKS", "INT"] as const;

describe("POL-05 new module demo seed coverage", () => {
  it("registers every new module demo seed in one auditable list", () => {
    const codes = new Set(NEW_MODULE_DEMO_SEEDS.map((seed) => seed.code));

    for (const code of REQUIRED_NEW_MODULE_CODES) {
      assert.equal(codes.has(code), true, `${code} seed is missing`);
    }
  });
});
