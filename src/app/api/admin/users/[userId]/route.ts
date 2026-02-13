import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!session?.user?.email || !ownerEmail || session.user.email !== ownerEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = (await req.json()) as { creditsBalance?: number };
  if (typeof body.creditsBalance !== "number" || body.creditsBalance < 0) {
    return NextResponse.json(
      { error: "creditsBalance must be a non-negative number" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { creditsBalance: body.creditsBalance },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!session?.user?.email || !ownerEmail || session.user.email !== ownerEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  await prisma.user.delete({
    where: { id: userId },
  });
  return NextResponse.json({ ok: true });
}
