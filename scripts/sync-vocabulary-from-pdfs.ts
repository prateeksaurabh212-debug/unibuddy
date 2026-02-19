/**
 * Sync vocabulary from the 4 fixed PDFs (content/vocabulary/A1.pdf … B2.pdf)
 * into the VocabularyWord table. Run after adding or updating those PDFs:
 *
 *   npm run sync-vocabulary
 *
 * Requires DIRECT_DATABASE_URL or DATABASE_URL (load from .env / .env.local).
 */

import { config } from "dotenv";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

config();
if (existsSync(join(process.cwd(), ".env.local"))) {
  config({ path: join(process.cwd(), ".env.local") });
}
import { PDFParse } from "pdf-parse";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Set DIRECT_DATABASE_URL or DATABASE_URL in .env or .env.local");
  process.exit(1);
}

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
const CONTENT_DIR = join(process.cwd(), "content", "vocabulary");

/** Extract German-friendly words from text (letters, äöüß, hyphenated compounds). */
function extractWords(text: string): string[] {
  const normalized = text.normalize("NFD").replace(/\p{M}/gu, "");
  const tokens = normalized.split(/[\s\d\p{P}\p{S}]+/u);
  const wordSet = new Set<string>();
  const wordLike = /^[\p{L}\p{M}-]+$/u;
  for (const t of tokens) {
    const w = t.trim();
    if (w.length >= 2 && wordLike.test(w)) {
      wordSet.add(w);
    }
  }
  return Array.from(wordSet);
}

function createPrisma() {
  const isAccelerate =
    dbUrl.startsWith("prisma://") || dbUrl.startsWith("prisma+postgres://");
  if (isAccelerate) {
    return new PrismaClient({ accelerateUrl: dbUrl });
  }
  const adapter = new PrismaPg({ connectionString: dbUrl });
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = createPrisma();

  for (const level of LEVELS) {
    const path = join(CONTENT_DIR, `${level}.pdf`);
    if (!existsSync(path)) {
      console.warn(`Skip ${level}: ${path} not found`);
      continue;
    }
    const buffer = readFileSync(path);
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    const raw = typeof result === "string" ? result : (result as { text?: string } | null)?.text ?? "";
    const text = raw.trim();
    if (!text) {
      console.warn(`Skip ${level}: no text extracted`);
      continue;
    }
    const words = extractWords(text);
    if (words.length < 10) {
      console.warn(`Skip ${level}: only ${words.length} words (need at least 10)`);
      continue;
    }
    await prisma.vocabularyWord.deleteMany({ where: { level } });
    await prisma.vocabularyWord.createMany({
      data: words.map((word) => ({ level, word })),
      skipDuplicates: true,
    });
    console.log(`${level}: ${words.length} words synced from ${level}.pdf`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
