import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Kontrol logging Prisma via environment variable
// Set PRISMA_LOG_LEVEL=query untuk enable, kosongkan untuk disable
const prismaLogLevel: ("query" | "info" | "warn" | "error")[] = process.env.PRISMA_LOG_LEVEL === "query" ? ["query"] : [];

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? prismaLogLevel : []
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Default export untuk kompatibilitas
export default db;
