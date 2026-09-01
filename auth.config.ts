import type { NextAuthConfig } from "next-auth";

// Route-protection-only config, used by proxy.ts. Deliberately excludes the
// Credentials provider (and therefore bcrypt + @/lib/prisma / Prisma's
// native query engine binary) — some hosts (Netlify) can't bundle native
// addons into the proxy/middleware function, and checking "is there a
// valid session" only needs AUTH_SECRET to verify the JWT cookie, not a
// database lookup. The full config with the provider lives in auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;
