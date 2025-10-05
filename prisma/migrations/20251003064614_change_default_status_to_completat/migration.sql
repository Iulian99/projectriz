-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activity" TEXT NOT NULL,
    "work" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Completat',
    "userId" INTEGER NOT NULL,
    "baseAct" TEXT,
    "attributes" TEXT,
    "complexity" TEXT,
    "timeSpent" INTEGER,
    "observations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_activities" ("activity", "attributes", "baseAct", "complexity", "createdAt", "date", "id", "observations", "status", "timeSpent", "updatedAt", "userId", "work") SELECT "activity", "attributes", "baseAct", "complexity", "createdAt", "date", "id", "observations", "status", "timeSpent", "updatedAt", "userId", "work" FROM "activities";
DROP TABLE "activities";
ALTER TABLE "new_activities" RENAME TO "activities";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
