/*
  Warnings:

  - You are about to drop the column `paymobIntentionId` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "paymobIntentionId",
ADD COLUMN     "completionRequestedByVendor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentOrderId" TEXT;
