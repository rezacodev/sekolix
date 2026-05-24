#!/usr/bin/env node

import { seedMinimal } from './scenarios/minimal.seed';
import { seedDemo } from './scenarios/demo.seed';
import { seedFull } from './scenarios/full.seed';

/**
 * Main seeding entry point
 * Usage:
 * - npm run prisma:seed (default: demo)
 * - npm run prisma:seed -- --scenario=minimal
 * - npm run prisma:seed -- --scenario=demo
 * - npm run prisma:seed -- --scenario=full
 */

async function main() {
  const args = process.argv.slice(2);
  const scenario = args.find(arg => arg.startsWith('--scenario='))?.split('=')[1] || 'demo';

  console.log('🌱 Starting Prisma seeding...');
  console.log(`📋 Scenario: ${scenario}`);

  try {
    switch (scenario) {
      case 'minimal':
        await seedMinimal();
        break;
      case 'demo':
        await seedDemo();
        break;
      case 'full':
        await seedFull();
        break;
      default:
        console.error(`❌ Unknown scenario: ${scenario}`);
        console.log('Available scenarios: minimal, demo, full');
        process.exit(1);
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();