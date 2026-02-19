/**
 * One-time translation and storage for vocabulary words.
 * Translates German → English and gets display form (der/die/das for nouns).
 * Used at build time (sync-vocabulary script), by sync-from-pdfs API (sync only), and translate-missing API.
 */

import type { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const BATCH_SIZE = 30;

async function translateBatch(germanWords: string[], openai: OpenAI): Promise<Record<string, string>> {
  if (germanWords.length === 0) return {};
  const prompt = `Translate each of these German words to English. Reply with only the English translations, one per line, in the same order. No numbering. Use a short phrase if needed (e.g. "to have", "of course").\n${germanWords.join("\n")}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) return {};
  const lines = text.split("\n").map((s) => s.replace(/^\d+[.)]\s*/, "").trim()).filter(Boolean);
  const out: Record<string, string> = {};
  germanWords.forEach((g, i) => {
    const en = lines[i]?.trim();
    if (en && en !== g) out[g] = en;
  });
  return out;
}

async function displayFormBatch(germanWords: string[], openai: OpenAI): Promise<Record<string, string>> {
  if (germanWords.length === 0) return {};
  const unique = [...new Set(germanWords)];
  const prompt = `For each German word below, if it is a noun reply with the definite article and the word (e.g. "der Mann", "die Frau", "das Buch"). Use "der", "die", or "das" and capitalize the noun. If it is not a noun (verb, adjective, etc.) reply with the word unchanged. One per line, same order. No numbering.\n${unique.join("\n")}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) return {};
  const lines = text.split("\n").map((s) => s.replace(/^\d+[.)]\s*/, "").trim()).filter(Boolean);
  const out: Record<string, string> = {};
  unique.forEach((g, i) => {
    out[g] = lines[i] ?? g;
  });
  return out;
}

export type VocabularyRecord = { id: string; word: string };

/**
 * Translate words in batches and update DB (english + displayForm).
 * Skips if OPENAI_API_KEY is missing. Returns counts.
 * @param records - Words to translate (id, word).
 * @param prismaInstance - Optional Prisma client (e.g. from build script); uses default app prisma if omitted.
 */
export async function translateAndStoreVocabulary(
  records: VocabularyRecord[],
  prismaInstance?: PrismaClient
): Promise<{ translated: number; failed: number; skipped: number }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || records.length === 0) {
    return { translated: 0, failed: 0, skipped: records.length };
  }

  const db = prismaInstance ?? prisma;
  const openai = new OpenAI({ apiKey });
  let translated = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const words = batch.map((r) => r.word);
    const [englishMap, displayFormMap] = await Promise.all([
      translateBatch(words, openai),
      displayFormBatch(words, openai),
    ]);

    for (const { id, word } of batch) {
      const english = englishMap[word];
      const displayForm = displayFormMap[word] ?? word;
      if (!english || english === word) {
        failed += 1;
        continue;
      }
      try {
        await db.vocabularyWord.update({
          where: { id },
          data: { english, displayForm },
        });
        translated += 1;
      } catch {
        failed += 1;
      }
    }
  }

  return { translated, failed, skipped: 0 };
}
