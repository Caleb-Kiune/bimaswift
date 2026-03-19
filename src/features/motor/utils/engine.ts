import { LEVIES } from "./constants";
import {
  RatingBand,
  TieredRider,
  InsuranceProduct,
  QuoteBreakdown,
  CalculatedRider,
} from "@/src/features/motor/types";

/**
 * Calculates the basic premium based on tiered rating bands.
 * Applies a percentage math floor to ensure the insurer's minimum premium is met.
 */
export function calculateBasicPremium(
  vehicleValue: number,
  bands: RatingBand[],
): number {
  const correctRatingBand = bands.find(
    (band) =>
      band.minVehicleValue <= vehicleValue &&
      band.maxVehicleValue >= vehicleValue,
  );

  if (!correctRatingBand) {
    throw new Error("Vehicle value out of range for basic premium");
  }

  const rate = correctRatingBand.basicRateBps;
  // Convert basis points to percentage and round to nearest whole shilling
  const calculatedPremium = Math.round(vehicleValue * (rate / 10000));

  // Apply the minimum premium floor
  return Math.max(calculatedPremium, correctRatingBand.basicMinPremium);
}

/**
 * Calculates the premium for a specific optional rider (e.g., PVT, Excess Protector).
 * Handles polymorphic rate types: FREE, FLAT, and PERCENTAGE_BPS.
 */
export function calculateRiderPremium(
  vehicleValue: number,
  rider: TieredRider,
): number {
  const bands = rider.bands;

  const correctRiderBand = bands.find(
    (band) =>
      band.minVehicleValue <= vehicleValue &&
      band.maxVehicleValue >= vehicleValue,
  );

  if (!correctRiderBand) {
    throw new Error("Vehicle value out of range for rider: " + rider.name);
  }

  const { rateType, rateValue, minPremium } = correctRiderBand;

  if (rateType === "FREE") {
    return 0; // Completely bypass minimum premiums for free tiers
  }

  if (rateType === "FLAT") {
    return rateValue; // Flat absolute cost regardless of vehicle value
  }

  if (rateType === "PERCENTAGE_BPS") {
    const riderPremium = Math.round(vehicleValue * (rateValue / 10000));
    return Math.max(riderPremium, minPremium);
  }

  // Fallback safety
  return 0;
}

/**
 * THE ORCHESTRATOR
 * Main engine function to compute the complete motor insurance quote breakdown.
 * Evaluates the cover type, aggregates riders, and computes regulatory levies.
 */
export default function calculateMotorPremium(
  vehicleValue: number,
  coverType: "COMPREHENSIVE" | "TPO",
  product: InsuranceProduct,
  selectedRiderIds: string[],
): QuoteBreakdown {
  // --- 1. INITIALIZATION ---
  let basicPremium = 0;
  const calculatedRiders: CalculatedRider[] = [];

  // --- 2. PREMIUM CALCULATION (ROUTING) ---
  if (coverType === "TPO") {
    // TPO carries a strict flat rate with no applicable riders
    basicPremium = product.tpoFlatPremium;
  } else if (coverType === "COMPREHENSIVE") {
    // A. Compute the foundational Comprehensive basic premium
    basicPremium = calculateBasicPremium(vehicleValue, product.ratingBands);

    // B. Process all selected optional riders
    for (const selectedId of selectedRiderIds) {
      // 1. Find the parent rider.
      // It matches if the parent ID matches, OR if one of its sub-options matches.
      const parentRider = product.riders.find(
        (r) =>
          r.id === selectedId ||
          (r.options && r.options.some((opt) => opt.id === selectedId)),
      );

      if (parentRider) {
        let premiumForThisRider = 0;
        let displayLabel = parentRider.name;

        // 2. Check if the user selected a specific option tier (e.g., 20 Days)
        const selectedOption = parentRider.options?.find(
          (opt) => opt.id === selectedId,
        );

        if (selectedOption) {
          // THE NEW WAY: If they selected a specific option, math is easy! Just grab the flat premium.
          premiumForThisRider = selectedOption.premium;
          displayLabel = selectedOption.label; // e.g., "20 Days (Limit: KES 60,000)"
        } else {
          // THE OLD WAY: It's a standard rider (like PVT or Excess Protector). Run the bands calculation.
          premiumForThisRider = calculateRiderPremium(
            vehicleValue,
            parentRider,
          );
        }

        // 3. Push to the final receipt
        calculatedRiders.push({
          id: selectedId,
          name: displayLabel,
          premium: premiumForThisRider,
        });
      }
    }
  }

  // --- 3. AGGREGATION & LEVIES ---
  // Sum up all dynamically calculated rider premiums
  const sumOfRiders = calculatedRiders.reduce(
    (total, currentRider) => total + currentRider.premium,
    0,
  );

  // Gross Premium is the subtotal before regulatory taxes
  const grossPremium = basicPremium + sumOfRiders;

  // IRA Mandated Levies (Calculated against Gross Premium, rounded to whole shillings)
  const itl = Math.round(grossPremium * (LEVIES.ITL_RATE_BPS / 10000));
  const phcf = Math.round(grossPremium * (LEVIES.PHCF_RATE_BPS / 10000));
  const stampDuty = LEVIES.STAMP_DUTY_KES;

  const totalPayable = grossPremium + itl + phcf + stampDuty;

  // --- 4. FINAL ASSEMBLY ---
  return {
    basicPremium,
    calculatedRiders,
    grossPremium,
    itl,
    phcf,
    stampDuty,
    totalPayable,
  };
}
