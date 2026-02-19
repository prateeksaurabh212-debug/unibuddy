import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Default seed: no vocabulary data.
 * Vocabulary comes only from the 4 fixed PDFs in content/vocabulary/ (A1–B2).
 * After adding those PDFs, run: npm run sync-vocabulary
 */
async function main() {
  console.log("Seed complete. Run 'npm run sync-vocabulary' after adding PDFs to content/vocabulary/.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
