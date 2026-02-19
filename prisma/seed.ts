import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default vocabulary per level so quizzes work without PDF sync (min 10 words per level).
const SEED_VOCABULARY: Record<string, string[]> = {
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

async function main() {
  for (const [level, words] of Object.entries(SEED_VOCABULARY)) {
    await prisma.vocabularyWord.deleteMany({ where: { level } });
    await prisma.vocabularyWord.createMany({
      data: words.map((word) => ({ level, word })),
      skipDuplicates: true,
    });
    console.log(`Vocabulary: ${level} – ${words.length} words seeded.`);
  }
  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
