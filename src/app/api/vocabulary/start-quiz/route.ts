import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
const CREDITS: Record<(typeof LEVELS)[number], number> = {
  A1: 2,
  A2: 2,
  B1: 3,
  B2: 3,
};

/** Default vocabulary per level (same as prisma/seed.ts). Used to seed on first use if build-time seed didn't run. */
const DEFAULT_VOCABULARY: Record<(typeof LEVELS)[number], string[]> = {
  A1: [
    "der", "die", "das", "und", "ist", "in", "ein", "eine", "haben", "werden",
    "nicht", "mit", "sich", "auf", "für", "sind", "können", "auch", "nach", "noch",
  ],
  A2: [
    "wenn", "nur", "oder", "sollen", "mehr", "schon", "dann", "werden", "sehr", "hier",
    "immer", "gehen", "machen", "wollen", "stehen", "sehen", "kommen", "sagen", "geben", "nehmen",
  ],
  B1: [
    "dadurch", "trotzdem", "deshalb", "allerdings", "eigentlich", "möglicherweise", "besonders", "genau",
    "verstehen", "erklären", "entscheiden", "erwarten", "verbessern", "vergleichen", "beschreiben",
    "erfolgreich", "wichtig", "persönlich", "politisch", "wirtschaftlich",
  ],
  B2: [
    "voraussetzen", "berücksichtigen", "zusammenarbeiten", "weiterentwickeln", "überprüfen",
    "Zusammenhang", "Entwicklung", "Möglichkeit", "Unterschied", "Erfahrung",
    "anscheinend", "tatsächlich", "insbesondere", "selbstverständlich", "einschließlich",
    "außerdem", "demzufolge", "hingegen", "andererseits", "folglich",
  ],
};

/** English meaning for default vocabulary (same order per level). Used for quiz prompt: "Select the German word for [English]". */
const DEFAULT_ENGLISH: Record<(typeof LEVELS)[number], string[]> = {
  A1: [
    "the (m)", "the (f)", "the (n)", "and", "is", "in", "a/an (m/n)", "a/an (f)", "to have", "to become",
    "not", "with", "oneself", "on", "for", "are", "can", "also", "after", "still",
  ],
  A2: [
    "when/if", "only", "or", "should", "more", "already", "then", "to become", "very", "here",
    "always", "to go", "to do/make", "to want", "to stand", "to see", "to come", "to say", "to give", "to take",
  ],
  B1: [
    "through that", "nevertheless", "therefore", "however", "actually", "possibly", "especially", "exactly",
    "to understand", "to explain", "to decide", "to expect", "to improve", "to compare", "to describe",
    "successful", "important", "personal", "political", "economic",
  ],
  B2: [
    "to assume", "to consider", "to work together", "to develop further", "to check",
    "context", "development", "possibility", "difference", "experience",
    "apparently", "actually", "in particular", "of course", "including",
    "besides", "consequently", "whereas", "on the other hand", "therefore",
  ],
};

/** German word → English (for quiz prompt). Built from DEFAULT_VOCABULARY + DEFAULT_ENGLISH. */
const GERMAN_TO_ENGLISH: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const level of LEVELS) {
    const words = DEFAULT_VOCABULARY[level];
    const english = DEFAULT_ENGLISH[level];
    words.forEach((w, i) => {
      if (english[i]) map[w] = english[i];
    });
  }
  return map;
})();

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Translate German words to English via OpenAI (for PDF-sourced words). Returns German -> English map. */
async function translateToEnglish(germanWords: string[]): Promise<Record<string, string>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim() || germanWords.length === 0) return {};

  try {
    const openai = new OpenAI({ apiKey });
    const prompt = `Translate each of these German words to English. Reply with only the English translations, one per line, in the same order. No numbering. Use a short phrase if needed (e.g. "to have", "of course").\n${germanWords.join("\n")}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return {};

    const lines = text.split("\n").map((s) => s.replace(/^\d+[.)]\s*/, "").trim()).filter(Boolean);
    const out: Record<string, string> = {};
    germanWords.forEach((g, i) => {
      out[g] = lines[i] ?? g;
    });
    return out;
  } catch (e) {
    console.warn("vocabulary translateToEnglish error:", e);
    return {};
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as { level?: string };
    const level = body.level;
    if (!level || !LEVELS.includes(level as (typeof LEVELS)[number])) {
      return NextResponse.json(
        { error: "level must be A1, A2, B1, or B2" },
        { status: 400 }
      );
    }
    const creditsRequired = CREDITS[level as (typeof LEVELS)[number]];
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, creditsBalance: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.creditsBalance < creditsRequired) {
      return NextResponse.json(
        { error: "Not enough credits", creditsRequired },
        { status: 403 }
      );
    }

    let words = await prisma.vocabularyWord.findMany({
      where: { level },
      select: { id: true, word: true },
    });
    // If build-time seed didn't run (e.g. env at deploy), seed this level on first use.
    if (words.length < 10) {
      const defaultWords = DEFAULT_VOCABULARY[level as (typeof LEVELS)[number]];
      if (defaultWords?.length >= 10) {
        try {
          await prisma.vocabularyWord.createMany({
            data: defaultWords.map((word) => ({ level, word })),
            skipDuplicates: true,
          });
          words = await prisma.vocabularyWord.findMany({
            where: { level },
            select: { id: true, word: true },
          });
        } catch (seedErr) {
          console.error("vocabulary/start-quiz seed fallback error:", seedErr);
        }
      }
    }
    if (words.length < 10) {
      return NextResponse.json(
        { error: `Not enough vocabulary for ${level}. Need at least 10 words. Add words via PDF upload or admin.` },
        { status: 400 }
      );
    }

    const shuffled = shuffle(words);
    const selected = shuffled.slice(0, 10);
    const rest = shuffled.slice(10);

    const wordsToTranslate = selected.map((item) => item.word);
    const translated = await translateToEnglish(wordsToTranslate);

    const missing = wordsToTranslate.filter((w) => !translated[w] || translated[w] === w);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error:
            "Translation failed for some words. Set OPENAI_API_KEY and try again.",
        },
        { status: 400 }
      );
    }

    const questions = selected.map((item, index) => {
      const correctWord = item.word;
      const promptEnglish = translated[correctWord]!;
      const others = rest
        .filter((w) => w.word !== correctWord)
        .slice(0, 3)
        .map((w) => w.word);
      let othersList = others;
      if (others.length < 3) {
        othersList = [...others];
        const pool = shuffled.filter((w) => w.word !== correctWord && !othersList.includes(w.word));
        while (othersList.length < 3 && pool.length > 0) {
          const extra = pool.find((w) => !othersList.includes(w.word));
          if (extra) {
            othersList.push(extra.word);
          } else break;
        }
      }
      const options = shuffle([correctWord, ...othersList.slice(0, 3)]);
      return {
        id: `v-${level}-${index}-${item.id}`,
        word: correctWord,
        promptEnglish,
        options: options.map((text, optIndex) => ({ text, index: optIndex })),
        correctIndex: options.indexOf(correctWord),
      };
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { creditsBalance: { decrement: creditsRequired } },
    });

    return NextResponse.json({
      level,
      creditsUsed: creditsRequired,
      questions: questions.map((q) => ({
        id: q.id,
        word: q.word,
        promptEnglish: q.promptEnglish,
        options: q.options,
        correctIndices: [q.correctIndex],
      })),
    });
  } catch (e) {
    console.error("vocabulary/start-quiz error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to start quiz" },
      { status: 500 }
    );
  }
}
