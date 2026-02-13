import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { action?: string };
    if (body.action !== "retry") {
      return NextResponse.json(
        { error: "Invalid action. Use action: 'retry' for taking the test again." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, creditsBalance: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.creditsBalance < 1) {
      return NextResponse.json(
        { error: "No credits left. You need 1 credit to take the test again." },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { creditsBalance: { decrement: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("use-credit error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to use credit" },
      { status: 500 }
    );
  }
}
