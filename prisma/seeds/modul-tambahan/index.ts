import { seedParentPortalDemo } from "../parent/parent.seed";
import { seedFinanceDemo } from "../finance/finance.seed";
import { seedBkDemo } from "../bk/bk.seed";
import { seedLibraryDemo } from "../library/library.seed";
import { seedInventoryDemo } from "../inventory/inventory.seed";
import { seedStaffOpsDemo } from "../staff-ops/staff-ops.seed";
import { seedOfficeDemo } from "../office/office.seed";
import { seedExtracurricularDemo } from "../extracurricular/extracurricular.seed";
import { seedIntegrationDemo } from "../integration/integration.seed";

export type NewModuleDemoSeed = {
  code: "GOV" | "ORT" | "KEU" | "BKS" | "LIB" | "INV" | "SDM" | "TU" | "EKS" | "INT";
  label: string;
  seed: () => Promise<void>;
  seededByCore?: boolean;
};

async function seedGovernanceAlreadyHandledByCore() {
  console.log("Governance foundation seeded by seedCore");
}

export const NEW_MODULE_DEMO_SEEDS: NewModuleDemoSeed[] = [
  { code: "GOV", label: "Audit, Keamanan, dan Tata Kelola", seed: seedGovernanceAlreadyHandledByCore, seededByCore: true },
  { code: "ORT", label: "Portal Orang Tua/Wali", seed: seedParentPortalDemo },
  { code: "KEU", label: "Keuangan/SPP", seed: seedFinanceDemo },
  { code: "BKS", label: "BK, Kedisiplinan, Prestasi", seed: seedBkDemo },
  { code: "LIB", label: "Perpustakaan", seed: seedLibraryDemo },
  { code: "INV", label: "Inventaris/Sarpras", seed: seedInventoryDemo },
  { code: "SDM", label: "Manajemen Pegawai", seed: seedStaffOpsDemo },
  { code: "TU", label: "Surat Menyurat & Administrasi TU", seed: seedOfficeDemo },
  { code: "EKS", label: "Ekstrakurikuler & Kegiatan", seed: seedExtracurricularDemo },
  { code: "INT", label: "Integrasi Data Pendidikan", seed: seedIntegrationDemo },
];

export async function seedModulTambahanDemo() {
  console.log("Seeding all new module demo data...");

  for (const moduleSeed of NEW_MODULE_DEMO_SEEDS) {
    if (moduleSeed.seededByCore) {
      await moduleSeed.seed();
      continue;
    }

    console.log(`Seeding ${moduleSeed.code}: ${moduleSeed.label}`);
    await moduleSeed.seed();
  }

  console.log("All new module demo data seeded");
}
