/*
  Warnings:

  - You are about to drop the `MotorCommercialQuote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MotorCommercialQuote";

-- DropTable
DROP TABLE "Quote";

-- CreateTable
CREATE TABLE "SavedQuote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "insurerName" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "coverType" TEXT NOT NULL,
    "totalPremium" DOUBLE PRECISION NOT NULL,
    "sumInsured" DOUBLE PRECISION,
    "quoteData" JSONB NOT NULL,
    "requestData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedQuote_pkey" PRIMARY KEY ("id")
);
