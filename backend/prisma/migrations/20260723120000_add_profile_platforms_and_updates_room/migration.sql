ALTER TABLE "User"
ADD COLUMN "showCertifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "hackTheBox" VARCHAR(80) NOT NULL DEFAULT '',
ADD COLUMN "rootMe" VARCHAR(80) NOT NULL DEFAULT '',
ADD COLUMN "tryHackMe" VARCHAR(80) NOT NULL DEFAULT '',
ADD COLUMN "otherPlatformName" VARCHAR(60) NOT NULL DEFAULT '',
ADD COLUMN "otherPlatformUrl" VARCHAR(300) NOT NULL DEFAULT '',
ADD COLUMN "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

INSERT INTO "HubRoom" (
  "key",
  "label",
  "description",
  "icon",
  "isPublic",
  "bannedUsers",
  "createdAt",
  "updatedAt"
)
VALUES (
  'updates',
  'Updates',
  'Nouveautés, correctifs et annonces officielles de GowlSec',
  'radio',
  true,
  ARRAY[]::TEXT[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "icon" = EXCLUDED."icon",
  "isPublic" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
