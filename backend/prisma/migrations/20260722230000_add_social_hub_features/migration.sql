ALTER TABLE "User"
  ADD COLUMN "profileStatus" VARCHAR(30) NOT NULL DEFAULT 'learning',
  ADD COLUMN "specialties" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showAge" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showSocials" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "age" INTEGER,
  ADD COLUMN "pinnedBadges" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "customRole" VARCHAR(40) NOT NULL DEFAULT '';

CREATE TABLE "ProfileRecommendation" (
  "id" SERIAL PRIMARY KEY,
  "type" VARCHAR(20) NOT NULL DEFAULT 'thanks',
  "skill" VARCHAR(50) NOT NULL DEFAULT '',
  "message" VARCHAR(500) NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "targetId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "authorId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "ProfileRecommendation_targetId_createdAt_idx" ON "ProfileRecommendation"("targetId", "createdAt");
CREATE INDEX "ProfileRecommendation_authorId_idx" ON "ProfileRecommendation"("authorId");

CREATE TABLE "DirectMessage" (
  "id" SERIAL PRIMARY KEY,
  "content" VARCHAR(1000) NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "senderId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "receiverId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "DirectMessage_senderId_receiverId_createdAt_idx" ON "DirectMessage"("senderId", "receiverId", "createdAt");
CREATE INDEX "DirectMessage_receiverId_readAt_idx" ON "DirectMessage"("receiverId", "readAt");

CREATE TABLE "TeamInvitation" (
  "id" SERIAL PRIMARY KEY,
  "message" VARCHAR(300) NOT NULL DEFAULT '',
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "teamId" INTEGER NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  "senderId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "recipientId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "TeamInvitation_recipientId_status_idx" ON "TeamInvitation"("recipientId", "status");
CREATE INDEX "TeamInvitation_teamId_status_idx" ON "TeamInvitation"("teamId", "status");

CREATE TABLE "TeamFinderProfile" (
  "id" SERIAL PRIMARY KEY,
  "age" INTEGER,
  "experience" VARCHAR(30) NOT NULL DEFAULT 'debutant',
  "bio" VARCHAR(600) NOT NULL DEFAULT '',
  "specialties" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "lookingFor" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "availability" VARCHAR(120) NOT NULL DEFAULT '',
  "contactPreference" VARCHAR(30) NOT NULL DEFAULT 'message',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" INTEGER NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "TeamFinderProfile_active_updatedAt_idx" ON "TeamFinderProfile"("active", "updatedAt");

CREATE TABLE "HubPoll" (
  "id" SERIAL PRIMARY KEY,
  "question" VARCHAR(250) NOT NULL,
  "room" VARCHAR(80) NOT NULL DEFAULT 'general',
  "endsAt" TIMESTAMP(3),
  "closed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "authorId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "HubPoll_room_createdAt_idx" ON "HubPoll"("room", "createdAt");

CREATE TABLE "HubPollOption" (
  "id" SERIAL PRIMARY KEY,
  "label" VARCHAR(120) NOT NULL,
  "pollId" INTEGER NOT NULL REFERENCES "HubPoll"("id") ON DELETE CASCADE
);
CREATE INDEX "HubPollOption_pollId_idx" ON "HubPollOption"("pollId");

CREATE TABLE "HubPollVote" (
  "id" SERIAL PRIMARY KEY,
  "pollId" INTEGER NOT NULL REFERENCES "HubPoll"("id") ON DELETE CASCADE,
  "optionId" INTEGER NOT NULL REFERENCES "HubPollOption"("id") ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "HubPollVote_pollId_userId_key" UNIQUE ("pollId", "userId")
);
CREATE INDEX "HubPollVote_optionId_idx" ON "HubPollVote"("optionId");

CREATE TABLE "WeeklyChallenge" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(150) NOT NULL,
  "description" VARCHAR(1200) NOT NULL,
  "category" VARCHAR(50) NOT NULL DEFAULT 'Web',
  "difficulty" VARCHAR(30) NOT NULL DEFAULT 'Intermédiaire',
  "link" VARCHAR(500) NOT NULL DEFAULT '',
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "authorId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "WeeklyChallenge_active_endsAt_idx" ON "WeeklyChallenge"("active", "endsAt");

CREATE TABLE "CommunityReport" (
  "id" SERIAL PRIMARY KEY,
  "targetType" VARCHAR(30) NOT NULL,
  "targetId" VARCHAR(120) NOT NULL,
  "reason" VARCHAR(80) NOT NULL,
  "details" VARCHAR(600) NOT NULL DEFAULT '',
  "status" VARCHAR(20) NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "reporterId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "resolverId" INTEGER REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE INDEX "CommunityReport_status_createdAt_idx" ON "CommunityReport"("status", "createdAt");
CREATE INDEX "CommunityReport_targetType_targetId_idx" ON "CommunityReport"("targetType", "targetId");

CREATE TABLE "UserNotification" (
  "id" SERIAL PRIMARY KEY,
  "type" VARCHAR(30) NOT NULL,
  "title" VARCHAR(150) NOT NULL,
  "message" VARCHAR(500) NOT NULL,
  "link" VARCHAR(300) NOT NULL DEFAULT '',
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "UserNotification_userId_readAt_createdAt_idx" ON "UserNotification"("userId", "readAt", "createdAt");

CREATE TABLE "TeamScoreEntry" (
  "id" SERIAL PRIMARY KEY,
  "eventId" VARCHAR(120) NOT NULL,
  "eventTitle" VARCHAR(200) NOT NULL,
  "rank" INTEGER NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "bestPlayer" VARCHAR(80) NOT NULL DEFAULT '',
  "highlight" VARCHAR(500) NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "teamId" INTEGER NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  "authorId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "TeamScoreEntry_teamId_eventId_key" UNIQUE ("teamId", "eventId")
);
CREATE INDEX "TeamScoreEntry_teamId_rank_idx" ON "TeamScoreEntry"("teamId", "rank");

ALTER TABLE "User" ADD CONSTRAINT "User_age_check" CHECK ("age" IS NULL OR ("age" BETWEEN 13 AND 100));
ALTER TABLE "TeamFinderProfile" ADD CONSTRAINT "TeamFinderProfile_age_check" CHECK ("age" IS NULL OR ("age" BETWEEN 13 AND 100));
ALTER TABLE "TeamScoreEntry" ADD CONSTRAINT "TeamScoreEntry_rank_check" CHECK ("rank" > 0);
