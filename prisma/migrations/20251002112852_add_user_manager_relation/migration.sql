-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "identifier" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "avatar" TEXT,
    "department" TEXT,
    "badge" TEXT,
    "position" TEXT,
    "employeeCode" TEXT,
    "unit" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birthDate" DATETIME,
    "hireDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "managerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("address", "avatar", "badge", "birthDate", "createdAt", "department", "email", "employeeCode", "hireDate", "id", "identifier", "name", "password", "phone", "position", "role", "status", "unit", "updatedAt") SELECT "address", "avatar", "badge", "birthDate", "createdAt", "department", "email", "employeeCode", "hireDate", "id", "identifier", "name", "password", "phone", "position", "role", "status", "unit", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_identifier_key" ON "users"("identifier");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
