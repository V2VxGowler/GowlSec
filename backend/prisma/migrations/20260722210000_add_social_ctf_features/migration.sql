ALTER TABLE "User"
  ADD COLUMN "currentStreak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastActiveDate" TIMESTAMP(3);

CREATE TABLE "UserBadge" (
  "id" SERIAL NOT NULL,
  "key" VARCHAR(50) NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER NOT NULL,
  CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Announcement" (
  "id" SERIAL NOT NULL,
  "title" VARCHAR(150) NOT NULL,
  "content" VARCHAR(2000) NOT NULL,
  "category" VARCHAR(30) NOT NULL DEFAULT 'announcement',
  "link" VARCHAR(500) NOT NULL DEFAULT '',
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "authorId" INTEGER NOT NULL,
  CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CtfRegistration" (
  "id" SERIAL NOT NULL,
  "eventId" VARCHAR(120) NOT NULL,
  "eventTitle" VARCHAR(200) NOT NULL,
  "startsAt" TIMESTAMP(3),
  "teamName" VARCHAR(80) NOT NULL DEFAULT 'Solo',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER NOT NULL,
  "teamId" INTEGER,
  CONSTRAINT "CtfRegistration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CtfResult" (
  "id" SERIAL NOT NULL,
  "eventId" VARCHAR(120) NOT NULL,
  "teamName" VARCHAR(80) NOT NULL,
  "rank" INTEGER NOT NULL,
  "highlight" VARCHAR(500) NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "authorId" INTEGER NOT NULL,
  CONSTRAINT "CtfResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserBadge_userId_key_key" ON "UserBadge"("userId", "key");
CREATE INDEX "UserBadge_key_idx" ON "UserBadge"("key");
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");
CREATE INDEX "Announcement_authorId_idx" ON "Announcement"("authorId");
CREATE UNIQUE INDEX "CtfRegistration_eventId_userId_key" ON "CtfRegistration"("eventId", "userId");
CREATE INDEX "CtfRegistration_eventId_idx" ON "CtfRegistration"("eventId");
CREATE INDEX "CtfRegistration_teamId_idx" ON "CtfRegistration"("teamId");
CREATE UNIQUE INDEX "CtfResult_eventId_teamName_key" ON "CtfResult"("eventId", "teamName");
CREATE INDEX "CtfResult_eventId_rank_idx" ON "CtfResult"("eventId", "rank");
CREATE INDEX "CtfResult_authorId_idx" ON "CtfResult"("authorId");

ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CtfRegistration" ADD CONSTRAINT "CtfRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CtfRegistration" ADD CONSTRAINT "CtfRegistration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CtfResult" ADD CONSTRAINT "CtfResult_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
