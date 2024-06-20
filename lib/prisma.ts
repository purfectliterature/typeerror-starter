import { PrismaClient } from "@prisma/client";

const globalWithPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient;
};

const prisma =
  globalWithPrisma.prisma ??
  (process.env.NODE_ENV === "production"
    ? new PrismaClient({ log: ["info", "warn"] })
    : new PrismaClient({ log: ["query", "info", "warn"] }));

if (process.env.NODE_ENV !== "production") globalWithPrisma.prisma = prisma;

export default prisma;
