-- DropForeignKey
ALTER TABLE "PortfolioPost" DROP CONSTRAINT "PortfolioPost_vendorId_fkey";

-- AddForeignKey
ALTER TABLE "PortfolioPost" ADD CONSTRAINT "PortfolioPost_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
