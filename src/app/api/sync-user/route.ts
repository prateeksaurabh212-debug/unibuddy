import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: true });

  try {
    await prisma.user.upsert({
      where: { email: session.user.email },
      create: {
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        creditsBalance: 5,
      },
      update: {
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
      },
    });
  } catch (e) {
    console.error("[sync-user]", e);
  }
  return NextResponse.json({ ok: true });
}
