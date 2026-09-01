import { PrismaClient } from "@prisma/client";
// The "/web" build talks to Turso over plain HTTP (via @libsql/client/web)
// instead of the native-binding client — required on serverless hosts like
// Netlify Functions, which can't load compiled C++/Rust addons.
import { PrismaLibSQL } from "@prisma/adapter-libsql/web";

// Local dev uses the plain SQLite file (DATABASE_URL="file:./dev.db").
// On a serverless host (Netlify, Vercel, ...) there's no persistent disk,
// so production instead points at a hosted libSQL/Turso database via
// TURSO_DATABASE_URL + TURSO_AUTH_TOKEN. See README.md#deploying.
export function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Prevents creating a new PrismaClient on every hot-reload in dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
