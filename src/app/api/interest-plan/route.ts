import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ interestedInPremium: false, interestedInPro: false });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { interestedInPremium: true, interestedInPro: true },
    });
    return NextResponse.json({
      interestedInPremium: user?.interestedInPremium ?? false,
      interestedInPro: user?.interestedInPro ?? false,
    });
  } catch (e) {
    console.error("interest-plan GET error:", e);
    return NextResponse.json(
      { error: "Failed to load" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as { plan?: string };
    const plan = body.plan === "pro" ? "pro" : body.plan === "premium" ? "premium" : null;
    if (!plan) {
      return NextResponse.json(
        { error: "plan must be 'premium' or 'pro'" },
        { status: 400 }
      );
    }
    await prisma.user.update({
      where: { email: session.user.email },
      data:
        plan === "premium"
          ? { interestedInPremium: true }
          : { interestedInPro: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("interest-plan POST error:", e);
    return NextResponse.json(
      { error: "Failed to record interest" },
      { status: 500 }
    );
  }
}
