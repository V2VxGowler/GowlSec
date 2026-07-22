/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Lab` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Lab_ownerId_idx";

-- DropIndex
DROP INDEX "Team_ownerId_idx";

-- CreateTable
CREATE TABLE "CreationCooldown" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "lastCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CreationCooldown_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreationCooldown_lastCreatedAt_idx" ON "CreationCooldown"("lastCreatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreationCooldown_userId_type_key" ON "CreationCooldown"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Lab_ownerId_key" ON "Lab"("ownerId");

-- AddForeignKey
ALTER TABLE "CreationCooldown" ADD CONSTRAINT "CreationCooldown_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
