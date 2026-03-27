import {
  CommercialInsuranceProduct,
  CommercialVehicleRequest,
  BasePremiumResult,
  RiderBreakdown,
} from "../types/index.js";

// --- TPO CALCULATOR ---
export function calculateTpoBasePremium(
  product: CommercialInsuranceProduct,
  request: CommercialVehicleRequest,
): BasePremiumResult | null {
  const band = product.tpoBands.find(
    (band) =>
      band.usageType === request.usageType &&
      request.tonnage >= band.minTonnage &&
      request.tonnage <= band.maxTonnage,
  );

  if (!band) return null;

  let premium = band.flatPremium;
  let fleetDiscountApplied = false;

  if (request.isFleet && band.fleetPremium !== undefined) {
    premium = band.fleetPremium;
    fleetDiscountApplied = premium < band.flatPremium;
  }

  return {
    premium: premium,
    fleetDiscountApplied: fleetDiscountApplied,
    floorOverrodeDiscount: false,
    breakdown: {
      rateType: "FLAT",
      rateValue: premium,
      minimumApplied: false,
    },
  };
}

// --- COMPREHENSIVE CALCULATOR ---
export function calculateComprehensiveBasePremium(
  product: CommercialInsuranceProduct,
  request: CommercialVehicleRequest,
): BasePremiumResult | null {
  const band = product.ratingBands.find(
    (band) =>
      band.usageType === request.usageType &&
      (band.minTonnage === undefined || request.tonnage >= band.minTonnage) &&
      (band.maxTonnage === undefined || request.tonnage <= band.maxTonnage) &&
      request.sumInsured! >= band.minVehicleValue &&
      request.sumInsured! <= band.maxVehicleValue,
  );

  if (!band) return null;

  const rateToUse = request.isFleet
    ? (band.fleetRateBps ?? band.basicRateBps)
    : band.basicRateBps;

  const floorToUse = request.isFleet
    ? (band.fleetMinPremium ?? band.basicMinPremium)
    : band.basicMinPremium;

  const calculatedPremium = Math.floor(
    (request.sumInsured! * rateToUse) / 10000,
  );

  const finalPremium = Math.max(calculatedPremium, floorToUse);
  const floorIntervened = calculatedPremium < floorToUse;

  return {
    premium: finalPremium,
    fleetDiscountApplied: request.isFleet && rateToUse < band.basicRateBps,
    floorOverrodeDiscount: floorIntervened,
    breakdown: {
      rateType: "PERCENTAGE_BPS",
      rateValue: rateToUse,
      minimumApplied: floorIntervened,
    },
  };
}

// --- LEVIES CALCULATOR ---
export function leviesCalculator(
  combinedPremium: number,
  product: CommercialInsuranceProduct,
) {
  const trainingLevy = Math.floor(
    (combinedPremium * product.levies.trainingLevyBps) / 10000,
  );
  const policyholdersFund = Math.floor(
    (combinedPremium * product.levies.policyholdersFundBps) / 10000,
  );
  const stampDuty = product.levies.stampDuty;

  return {
    trainingLevy: {
      amount: trainingLevy,
      rateValueBps: product.levies.trainingLevyBps,
    },
    policyholdersFund: {
      amount: policyholdersFund,
      rateValueBps: product.levies.policyholdersFundBps,
    },
    stampDuty: { amount: stampDuty },
    totalLevies: trainingLevy + policyholdersFund + stampDuty,
  };
}

// --- RIDERS CALCULATOR ---
export function calculateRiders(
  product: CommercialInsuranceProduct,
  request: CommercialVehicleRequest,
) {
  let totalRiderPremium = 0;
  const riderDetails: RiderBreakdown[] = [];

  if (
    request.coverType !== "COMPREHENSIVE" ||
    !request.sumInsured ||
    !request.selectedRiders ||
    request.selectedRiders.length === 0
  ) {
    return { totalRiderPremium, riderDetails };
  }

  request.selectedRiders.forEach((riderId) => {
    const productRider = product.riders?.find((r) => r.type === riderId);

    if (productRider) {
      const band = productRider.bands.find(
        (b) =>
          request.sumInsured! >= b.minVehicleValue &&
          request.sumInsured! <= b.maxVehicleValue,
      );

      if (band) {
        let finalRiderPremium = 0;
        let minimumApplied = false;

        if (band.rateType === "PERCENTAGE_BPS") {
          const calculatedRider = Math.floor(
            (request.sumInsured! * band.rateValue) / 10000,
          );
          finalRiderPremium = Math.max(calculatedRider, band.minPremium);
          minimumApplied = calculatedRider < band.minPremium;
        } else if (band.rateType === "FLAT") {
          finalRiderPremium = band.rateValue;
        } else if (band.rateType === "FREE") {
          finalRiderPremium = 0;
        }

        totalRiderPremium += finalRiderPremium;

        riderDetails.push({
          riderId: productRider.type,
          name: productRider.name,
          premium: finalRiderPremium,
          rateType: band.rateType,
          rateValue: band.rateValue,
          minimumApplied: minimumApplied,
        });
      }
    }
  });

  return { totalRiderPremium, riderDetails };
}
