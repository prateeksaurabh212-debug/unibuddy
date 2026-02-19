/**
 * Sync vocabulary from the 4 fixed PDFs (content/vocabulary/A1.pdf … B2.pdf) into the DB.
 * GET or POST (authenticated). GET is supported as a workaround when POST returns 405 in production.
 * Heavy deps are loaded inside the handler so import-time errors are caught and returned as JSON.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Handle CORS preflight so POST with JSON can be sent. */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

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

/** Extract text from a PDF buffer using pdfjs-serverless (Node/serverless-safe, no DOMMatrix). */
async function extractTextFromPdfBuffer(data: Uint8Array): Promise<string> {
  const { getDocument } = await import("pdfjs-serverless");
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(pageText);
  }
  return parts.join(" ").trim();
}

async function runSync(): Promise<NextResponse> {
  try {
    const [{ prisma }, { translateAndStoreVocabulary }] = await Promise.all([
      import("@/lib/prisma").then((m) => ({ prisma: m.prisma })),
      import("@/lib/vocabulary-translate").then((m) => ({ translateAndStoreVocabulary: m.translateAndStoreVocabulary })),
    ]);

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
        const text = await extractTextFromPdfBuffer(new Uint8Array(buffer));
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
    console.error("vocabulary/sync-from-pdfs runSync error:", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Sync error: ${message}` }, { status: 500 });
  }
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Sync failed";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return await runSync();
  } catch (e) {
    console.error("vocabulary/sync-from-pdfs GET error:", e);
    return NextResponse.json(
      { error: errorMessage(e) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return await runSync();
  } catch (e) {
    console.error("vocabulary/sync-from-pdfs POST error:", e);
    return NextResponse.json(
      { error: errorMessage(e) },
      { status: 500 }
    );
  }
}
