-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "vehicleValue" INTEGER NOT NULL,
    "yom" INTEGER NOT NULL,
    "coverType" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "selectedRiderIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotorCommercialQuote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "insurerName" TEXT NOT NULL,
    "coverType" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "tonnage" DOUBLE PRECISION NOT NULL,
    "sumInsured" DOUBLE PRECISION,
    "isFleet" BOOLEAN NOT NULL,
    "includePLL" BOOLEAN NOT NULL,
    "passengerCount" INTEGER,
    "selectedRiders" TEXT[],
    "basicPremium" DOUBLE PRECISION NOT NULL,
    "pllCharge" DOUBLE PRECISION NOT NULL,
    "riderPremiums" DOUBLE PRECISION NOT NULL,
    "levies" DOUBLE PRECISION NOT NULL,
    "stampDuty" DOUBLE PRECISION NOT NULL,
    "totalPremium" DOUBLE PRECISION NOT NULL,
    "basePremiumDetails" JSONB,
    "riderDetails" JSONB,
    "levyDetails" JSONB,
    "floorOverrodeDiscount" BOOLEAN NOT NULL DEFAULT false,
    "fleetDiscountApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MotorCommercialQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_idempotencyKey_key" ON "Quote"("idempotencyKey");
