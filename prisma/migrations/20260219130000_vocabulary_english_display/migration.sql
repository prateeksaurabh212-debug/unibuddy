-- AlterTable
ALTER TABLE "VocabularyWord" ADD COLUMN "english" TEXT,
ADD COLUMN "displayForm" TEXT;

-- CreateIndex
CREATE INDEX "VocabularyWord_level_english_idx" ON "VocabularyWord"("level", "english");
