import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// On Vercel, env vars are only available to deployments built *after* they were added.
// Fallback so Preview deployments get a URL when NEXTAUTH_URL isn’t set for that environment.
const nextAuthUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const authOptions = {
  trustHost: true,
  ...(nextAuthUrl ? { url: nextAuthUrl } : {}),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  logger: process.env.NODE_ENV === "development"
    ? {
        error(code, metadata) {
          console.error("[NextAuth] error:", code, metadata);
        },
        warn(code) {
          console.warn("[NextAuth] warn:", code);
        },
        debug(code, metadata) {
          console.log("[NextAuth] debug:", code, metadata);
        },
      }
    : undefined,
  callbacks: {
    signIn() {
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email ?? session.user.email;
        try {
          const dbUser = token.email
            ? await prisma.user.findUnique({
                where: { email: token.email },
                select: { id: true, creditsBalance: true },
              })
            : null;
          session.user.id = dbUser?.id ?? token.sub ?? "";
          session.user.credits = dbUser?.creditsBalance ?? token.credits ?? 0;
        } catch {
          session.user.id = token.sub ?? "";
          session.user.credits = token.credits ?? 0;
        }
      }
      return session;
    },
    async jwt(args) {
      const { token, user, account } = args;
      try {
        if (account && user) {
          const u = user as { id?: string; email?: string | null };
          token.sub = String(u?.id ?? (u?.email ? `email-${u.email}` : "unknown"));
          token.email = (u?.email as string) ?? null;
          token.credits = 5;
        }
        return token;
      } catch (e) {
        console.error("[NextAuth] jwt callback threw:", e);
        return {
          ...token,
          sub: (token?.sub as string) ?? (token?.email ? `email-${token.email}` : "anon"),
          email: (token?.email as string) ?? null,
          credits: 0,
        };
      }
    },
  },
  pages: { signIn: "/auth/signin", error: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
} as NextAuthOptions;
