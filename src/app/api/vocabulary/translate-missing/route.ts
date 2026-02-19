/**
 * Backfill: translate all vocabulary words that have null english.
 * POST (authenticated). Requires OPENAI_API_KEY.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateAndStoreVocabulary } from "@/lib/vocabulary-translate";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.vocabularyWord.findMany({
      where: { english: null },
      select: { id: true, word: true },
    });

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, message: "No words need translation.", translated: 0 });
    }

    const result = await translateAndStoreVocabulary(rows);
    return NextResponse.json({
      ok: true,
      translated: result.translated,
      failed: result.failed,
      total: rows.length,
    });
  } catch (e) {
    console.error("vocabulary/translate-missing error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Translation failed" },
      { status: 500 }
    );
  }
}
