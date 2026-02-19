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
      select: { id: true, word: true, english: true, displayForm: true },
    });
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
            select: { id: true, word: true, english: true, displayForm: true },
          });
        } catch (seedErr) {
          console.error("vocabulary/start-quiz seed fallback error:", seedErr);
        }
      }
    }

    const withEnglish = words.filter((w): w is typeof w & { english: string } => w.english != null && w.english.trim() !== "");
    if (withEnglish.length < 10) {
      return NextResponse.json(
        {
          error:
            "Not enough vocabulary translated for this level. Run Sync from PDFs (with OPENAI_API_KEY set) or Translate missing, then try again.",
        },
        { status: 400 }
      );
    }

    const shuffled = shuffle(withEnglish);
    const selected = shuffled.slice(0, 10);
    const rest = shuffled.slice(10);

    const allOptionWords: string[] = [];
    const questionOptionWords: string[][] = [];
    for (let i = 0; i < selected.length; i++) {
      const correctWord = selected[i].word;
      const othersList = rest
        .filter((w) => w.word !== correctWord)
        .slice(0, 3)
        .map((w) => w.word);
      if (othersList.length < 3) {
        const pool = shuffled.filter((w) => w.word !== correctWord && !othersList.includes(w.word));
        while (othersList.length < 3 && pool.length > 0) {
          const extra = pool.find((w) => !othersList.includes(w.word));
          if (extra) othersList.push(extra.word);
          else break;
        }
      }
      const optionWords = [correctWord, ...othersList.slice(0, 3)];
      questionOptionWords.push(optionWords);
      allOptionWords.push(...optionWords);
    }

    const displayFormByWord: Record<string, string> = {};
    for (const row of shuffled) {
      displayFormByWord[row.word] = row.displayForm ?? row.word;
    }

    const questions = selected.map((item, index) => {
      const correctWord = item.word;
      const promptEnglish = item.english!;
      const optionWords = shuffle([...questionOptionWords[index]!]);
      const options = optionWords.map((word, optIndex) => ({
        text: displayFormByWord[word] ?? word,
        index: optIndex,
      }));
      const correctIndex = optionWords.indexOf(correctWord);
      return {
        id: `v-${level}-${index}-${item.id}`,
        word: correctWord,
        promptEnglish,
        options,
        correctIndex,
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
