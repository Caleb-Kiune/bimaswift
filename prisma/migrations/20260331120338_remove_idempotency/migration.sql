/*
  Warnings:

  - You are about to drop the column `idempotencyKey` on the `MotorCommercialQuote` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MotorCommercialQuote_idempotencyKey_key";

-- AlterTable
ALTER TABLE "MotorCommercialQuote" DROP COLUMN "idempotencyKey";
