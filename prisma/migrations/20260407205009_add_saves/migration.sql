-- CreateTable
CREATE TABLE "SavedPost" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PortfolioPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
