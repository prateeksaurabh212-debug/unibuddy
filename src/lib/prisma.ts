import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrisma> };

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL;
  const isAccelerate =
    typeof dbUrl === "string" &&
    (dbUrl.startsWith("prisma://") || dbUrl.startsWith("prisma+postgres://"));

  if (isAccelerate && dbUrl) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      accelerateUrl: dbUrl,
    }).$extends(withAccelerate());
  }

  const options: ConstructorParameters<typeof PrismaClient>[0] = {
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  };
  if (dbUrl) options.datasourceUrl = dbUrl;
  return new PrismaClient(options);
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
