-- CreateTable
CREATE TABLE "HubMessage" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "HubMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HubMessage_createdAt_idx" ON "HubMessage"("createdAt");

-- CreateIndex
CREATE INDEX "HubMessage_userId_idx" ON "HubMessage"("userId");

-- AddForeignKey
ALTER TABLE "HubMessage" ADD CONSTRAINT "HubMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
