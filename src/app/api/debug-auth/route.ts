import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const out: Record<string, unknown> = {
    hasSession: false,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set" : "missing",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "missing",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "set" : "missing",
    },
    prisma: "pending",
  };

  try {
    const session = await getServerSession(authOptions);
    out.hasSession = !!session;
    if (session?.user?.email) out.userEmail = session.user.email;

    await prisma.user.findFirst({ select: { id: true, email: true } });
    out.prisma = "ok";
  } catch (e) {
    out.prisma = "error";
    out.prismaError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(out);
}
