import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Placeholder image as data URL. Replace with AI-generated image when API key is available. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- param kept for future AI image by word
function placeholderImageUrl(word: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#1a1a1a" width="200" height="200"/><text x="100" y="100" text-anchor="middle" dy="0.35em" fill="#fff" font-family="system-ui" font-size="18">?</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
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

    await prisma.user.update({
      where: { id: user.id },
      data: { creditsBalance: { decrement: creditsRequired } },
    });

    const shuffled = shuffle(words);
    const selected = shuffled.slice(0, 10);
    const rest = shuffled.slice(10);
    const questions = selected.map((item, index) => {
      const correctWord = item.word;
      const others = rest
        .filter((w) => w.word !== correctWord)
        .slice(0, 3)
        .map((w) => w.word);
      while (others.length < 3 && words.length > 4) {
        const extra = words.find((w) => w.word !== correctWord && !others.includes(w.word));
        if (extra) others.push(extra.word);
        else break;
      }
      const options = shuffle([correctWord, ...others.slice(0, 3)]);
      return {
        id: `v-${level}-${index}-${item.id}`,
        word: correctWord,
        imageUrl: placeholderImageUrl(correctWord),
        options: options.map((text, optIndex) => ({ text, index: optIndex })),
        correctIndex: options.indexOf(correctWord),
      };
    });

    return NextResponse.json({
      level,
      creditsUsed: creditsRequired,
      questions: questions.map((q) => ({
        id: q.id,
        word: q.word,
        imageUrl: q.imageUrl,
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
