import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export async function GET(req: Request) {
  try {
    await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    if (!level || !LEVELS.includes(level as (typeof LEVELS)[number])) {
      return NextResponse.json(
        { error: "level must be A1, A2, B1, or B2" },
        { status: 400 }
      );
    }
    const words = await prisma.vocabularyWord.findMany({
      where: { level },
      select: { id: true, word: true },
      take: 500,
    });
    return NextResponse.json(words.map((w) => w.word));
  } catch (e) {
    console.error("vocabulary/words GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch words" },
      { status: 500 }
    );
  }
}
