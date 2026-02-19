/**
 * Sync vocabulary from the 4 fixed PDFs (content/vocabulary/A1.pdf … B2.pdf) into the DB.
 * Call POST /api/vocabulary/sync-from-pdfs (authenticated) after adding or updating those PDFs.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PDFParse } from "pdf-parse";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateAndStoreVocabulary } from "@/lib/vocabulary-translate";

export const dynamic = "force-dynamic";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

function extractWords(text: string): string[] {
  const normalized = text.normalize("NFD").replace(/\p{M}/gu, "");
  const tokens = normalized.split(/[\s\d\p{P}\p{S}]+/u);
  const wordSet = new Set<string>();
  const wordLike = /^[\p{L}\p{M}-]+$/u;
  for (const t of tokens) {
    const w = t.trim();
    if (w.length >= 2 && wordLike.test(w)) wordSet.add(w);
  }
  return Array.from(wordSet);
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentDir = join(process.cwd(), "content", "vocabulary");
    const results: { level: string; count: number; error?: string; translated?: number }[] = [];

    for (const level of LEVELS) {
      try {
        const path = join(contentDir, `${level}.pdf`);
        if (!existsSync(path)) {
          results.push({ level, count: 0, error: "PDF not found" });
          continue;
        }
        const buffer = readFileSync(path);
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        await parser.destroy();
        const raw = typeof result === "string" ? result : (result as { text?: string } | null)?.text ?? "";
        const text = raw.trim();
        if (!text) {
          results.push({ level, count: 0, error: "No text extracted" });
          continue;
        }
        const words = extractWords(text);
        if (words.length < 10) {
          results.push({ level, count: words.length, error: "Need at least 10 words" });
          continue;
        }
        await prisma.vocabularyWord.deleteMany({ where: { level } });
        await prisma.vocabularyWord.createMany({
          data: words.map((word) => ({ level, word })),
          skipDuplicates: true,
        });
        const rows = await prisma.vocabularyWord.findMany({
          where: { level },
          select: { id: true, word: true },
        });
        const { translated } = await translateAndStoreVocabulary(rows);
        results.push({
          level,
          count: words.length,
          translated: translated > 0 ? translated : undefined,
        });
      } catch (levelError) {
        console.error(`vocabulary/sync-from-pdfs ${level} error:`, levelError);
        results.push({
          level,
          count: 0,
          error: levelError instanceof Error ? levelError.message : "Failed to process PDF",
        });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    console.error("vocabulary/sync-from-pdfs error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}
