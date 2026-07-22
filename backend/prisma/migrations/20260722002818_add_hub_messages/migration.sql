-- DropIndex
DROP INDEX "HubMessage_createdAt_idx";

-- AlterTable
ALTER TABLE "HubMessage" ADD COLUMN     "room" VARCHAR(80) NOT NULL DEFAULT 'general';

-- CreateIndex
CREATE INDEX "HubMessage_room_createdAt_idx" ON "HubMessage"("room", "createdAt");
