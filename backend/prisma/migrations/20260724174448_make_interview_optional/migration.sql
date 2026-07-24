-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProctoringSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "strictMode" TEXT NOT NULL DEFAULT 'MEDIUM',
    "integrityScore" INTEGER,
    "cheatingProbability" INTEGER,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "maxViolations" INTEGER NOT NULL DEFAULT 10,
    "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    "fullscreenExits" INTEGER NOT NULL DEFAULT 0,
    "faceCapture" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminatedAt" DATETIME,
    "terminationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProctoringSession_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProctoringSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProctoringSession" ("cheatingProbability", "createdAt", "faceCapture", "fullscreenExits", "id", "integrityScore", "interviewId", "maxViolations", "startedAt", "status", "strictMode", "tabSwitchCount", "terminatedAt", "terminationReason", "updatedAt", "userId", "violationCount") SELECT "cheatingProbability", "createdAt", "faceCapture", "fullscreenExits", "id", "integrityScore", "interviewId", "maxViolations", "startedAt", "status", "strictMode", "tabSwitchCount", "terminatedAt", "terminationReason", "updatedAt", "userId", "violationCount" FROM "ProctoringSession";
DROP TABLE "ProctoringSession";
ALTER TABLE "new_ProctoringSession" RENAME TO "ProctoringSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
