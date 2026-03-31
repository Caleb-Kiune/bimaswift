/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `MotorCommercialQuote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `MotorCommercialQuote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MotorCommercialQuote" ADD COLUMN     "idempotencyKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MotorCommercialQuote_idempotencyKey_key" ON "MotorCommercialQuote"("idempotencyKey");
