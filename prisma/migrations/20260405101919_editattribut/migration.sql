/*
  Warnings:

  - You are about to drop the column `Experience` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `PortfolioUrl` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `ProfileStatus` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `Type` on the `Vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "Experience",
DROP COLUMN "PortfolioUrl",
DROP COLUMN "ProfileStatus",
DROP COLUMN "Type",
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
ADD COLUMN     "type" INTEGER;
