import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { id } = await params;
    const attempt = await prisma.testAttempt.findFirst({
      where: { id, userId: user.id },
    });
    if (!attempt) {
      return NextResponse.json({ error: "Past test not found" }, { status: 404 });
    }
    return NextResponse.json(attempt);
  } catch (e) {
    console.error("past-tests [id] GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load past test" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { id } = await params;
    const attempt = await prisma.testAttempt.findFirst({
      where: { id, userId: user.id },
    });
    if (!attempt) {
      return NextResponse.json({ error: "Past test not found" }, { status: 404 });
    }
    await prisma.testAttempt.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("past-tests [id] DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete past test" },
      { status: 500 }
    );
  }
}
