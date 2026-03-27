import { CommercialInsuranceProduct, CommercialVehicleRequest } from "../types";

//TPO

export function calculateTpoBasePremium(
  product: CommercialInsuranceProduct,
  request: CommercialVehicleRequest,
): number | null {
  const band = product.tpoBands.find(
    (band) =>
      band.usageType === request.usageType &&
      request.tonnage >= band.minTonnage &&
      request.tonnage <= band.maxTonnage,
  );

  // If the vehicle doesn't fit the insurer's rules, gracefully decline
  if (!band) return null;

  // Check if it's a fleet and if the insurer offers a specific TPO fleet rate
  if (request.isFleet && band.fleetPremium !== undefined) {
    return band.fleetPremium;
  }

  // Otherwise, return the standard flat premium
  return band.flatPremium;
}

// COMP

export function calculateComprehensiveBasePremium(
  product: CommercialInsuranceProduct,
  request: CommercialVehicleRequest,
): number | null {
  const band = product.ratingBands.find(
    (band) =>
      band.usageType === request.usageType &&
      (band.minTonnage === undefined || request.tonnage >= band.minTonnage) &&
      (band.maxTonnage === undefined || request.tonnage <= band.maxTonnage) &&
      request.sumInsured! >= band.minVehicleValue &&
      request.sumInsured! <= band.maxVehicleValue,
  );

  if (!band) return null; // Gracefully decline

  // 1. Determine which rate and floor to use based on the fleet flag
  // The ?? operator safely falls back to the basic rate/minimum if the underwriter doesn't offer a fleet specific one.
  const rateToUse = request.isFleet 
    ? (band.fleetRateBps ?? band.basicRateBps) 
    : band.basicRateBps;

  const floorToUse = request.isFleet 
    ? (band.fleetMinPremium ?? band.basicMinPremium) 
    : band.basicMinPremium;

  // 2. Do the math once using Basis Points
  const calculatedPremium = Math.floor(
    (request.sumInsured! * rateToUse) / 10000
  );

  // 3. Enforce the floor
  return Math.max(calculatedPremium, floorToUse);
}

//LEVIES

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

  return { trainingLevy, policyholdersFund, stampDuty };
}
