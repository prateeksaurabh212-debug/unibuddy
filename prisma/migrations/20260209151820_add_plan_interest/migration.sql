-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "creditsBalance" INTEGER NOT NULL DEFAULT 5,
    "lastCreditsResetAt" DATETIME,
    "interestedInPremium" BOOLEAN NOT NULL DEFAULT false,
    "interestedInPro" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "creditsBalance", "email", "emailVerified", "id", "image", "lastCreditsResetAt", "name", "updatedAt") SELECT "createdAt", "creditsBalance", "email", "emailVerified", "id", "image", "lastCreditsResetAt", "name", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
