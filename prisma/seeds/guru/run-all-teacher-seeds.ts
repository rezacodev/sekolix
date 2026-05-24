import { execSync } from "child_process";

const seeds = [
  "seed-syllabus-rpp.ts",
  "seed-assignments.ts",
  "seed-teaching-materials.ts",
];

console.log("🚀 Running all seeds for Teacher Portal modules...\n");

for (const seed of seeds) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running: ${seed}`);
  console.log("=".repeat(60));
  
  try {
    execSync(`tsx prisma/seeds/${seed}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Error running ${seed}:`, error);
    process.exit(1);
  }
}

console.log("\n" + "=".repeat(60));
console.log("✅ All seeds completed successfully!");
console.log("=".repeat(60));
