import { LEVIES } from "@/src/features/motor-private/utils/constants";
import {
  RatingBand,
  TieredRider,
  InsuranceProduct,
  BasicPremiumBreakdown,
  ExplainedValue,
  RiderBreakdown,
  DetailedCalculatedRider,
  DetailedQuoteBreakdown,
} from "@/src/features/motor-private/types";

/**
 * Calculates the basic premium based on tiered rating bands.
 * Applies a percentage math floor to ensure the insurer's minimum premium is met.
 */
export function calculateBasicPremium(
  vehicleValue: number,
  bands: RatingBand[],
): ExplainedValue<BasicPremiumBreakdown> {
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
  // return Math.max(calculatedPremium, correctRatingBand.basicMinPremium);

  //check if minimum was applied
  const isMinPremiumApplied =
    calculatedPremium < correctRatingBand.basicMinPremium;

  return {
    value: isMinPremiumApplied
      ? correctRatingBand.basicMinPremium
      : calculatedPremium,
    breakdown: {
      rateBps: rate,
      rawCalculation: calculatedPremium,
      isMinPremiumApplied: isMinPremiumApplied,
    },
  };
}

/**
 * Calculates the premium for a specific optional rider (e.g., PVT, Excess Protector).
 * Handles polymorphic rate types: FREE, FLAT, and PERCENTAGE_BPS.
 */
export function calculateRiderPremium(
  vehicleValue: number,
  rider: TieredRider,
): ExplainedValue<RiderBreakdown> {
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
    return {
      value: 0,
      breakdown: {
        rateType: "FREE",
        rateValue: 0,
        rawCalculation: 0,
        isMinPremiumApplied: false,
      },
    };
  }

  if (rateType === "FLAT") {
    return {
      value: rateValue,
      breakdown: {
        rateType: "FLAT",
        rateValue: rateValue,
        rawCalculation: rateValue,
        isMinPremiumApplied: false,
      },
    };
  }

  if (rateType === "PERCENTAGE_BPS") {
    const riderPremium = Math.round(vehicleValue * (rateValue / 10000));
    // return Math.max(riderPremium, minPremium);
    return {
      value: Math.max(riderPremium, minPremium),
      breakdown: {
        rateType: "PERCENTAGE_BPS",
        rateValue: rateValue,
        rawCalculation: riderPremium,
        isMinPremiumApplied: riderPremium < minPremium,
      },
    };
  }

  // Fallback safety
  return {
    value: 0,
    breakdown: {
      rateType: "FREE",
      rateValue: 0,
      rawCalculation: 0,
      isMinPremiumApplied: false,
    },
  };
}

/**
 * THE ORCHESTRATOR
 * Main engine function to compute the complete motor insurance quote breakdown.
 * Evaluates the cover type, aggregates riders, and computes regulatory levies.
 */
export default function calculatePremium(
  vehicleValue: number,
  coverType: "COMPREHENSIVE" | "TPO",
  product: InsuranceProduct,
  selectedRiders: Record<string, string | boolean>,
): DetailedQuoteBreakdown {
  // --- 1. INITIALIZATION ---
  let basicPremium: ExplainedValue<BasicPremiumBreakdown> = {
    value: 0,
    breakdown: {
      rateBps: 0,
      rawCalculation: 0,
      isMinPremiumApplied: false,
    },
  };
  const calculatedRiders: DetailedCalculatedRider[] = [];

  // --- 2. PREMIUM CALCULATION (ROUTING) ---
  if (coverType === "TPO") {
    // TPO carries a strict flat rate with no applicable riders
    basicPremium = {
      value: product.tpoFlatPremium,
      breakdown: {
        rateBps: 0,
        rawCalculation: product.tpoFlatPremium,
        isMinPremiumApplied: false,
      },
    };
  } else if (coverType === "COMPREHENSIVE") {
    // A. Compute the foundational Comprehensive basic premium
    basicPremium = calculateBasicPremium(vehicleValue, product.ratingBands);

    // B. Process all optional riders
    for (const rider of product.riders) {
      let isExplicitlySelected = false;
      let selectedOptionId: string | undefined = undefined;

      const userSelection = selectedRiders[rider.type] || selectedRiders[rider.id];

      if (userSelection) {
        isExplicitlySelected = true;
        if (typeof userSelection === "string") {
          selectedOptionId = userSelection; // user explicitly chose a specific option
        }
      }

      // If neither explicitly selected NOR an option-based rider, mathematically check if it's FREE
      let evaluateAsFree = false;
      if (!isExplicitlySelected && !rider.options) {
        const activeBand = rider.bands?.find(
          (band) => band.minVehicleValue <= vehicleValue && band.maxVehicleValue >= vehicleValue
        );
        if (activeBand?.rateType === "FREE") {
          evaluateAsFree = true;
        }
      }

      if (isExplicitlySelected || evaluateAsFree) {
        let premiumForThisRider: ExplainedValue<RiderBreakdown>;
        let displayLabel = rider.name;
        let usedId = rider.id;

        // 2. Compute based on options vs bands
        if (selectedOptionId) {
          const selectedOption = rider.options?.find((opt) => opt.id === selectedOptionId);
          if (selectedOption) {
            premiumForThisRider = {
              value: selectedOption.premium,
              breakdown: {
                rateType: "OPTION_SELECTION",
                rateValue: selectedOption.premium,
                rawCalculation: selectedOption.premium,
                isMinPremiumApplied: false,
              },
            };
            displayLabel = selectedOption.label;
            usedId = selectedOption.id;
          } else {
            continue; // Skip if invalid option was somehow provided
          }
        } else {
          premiumForThisRider = calculateRiderPremium(vehicleValue, rider);
        }

        // 3. Push to the final receipt
        calculatedRiders.push({
          id: usedId,
          name: displayLabel,
          premium: premiumForThisRider,
        });
      }
    }
  }

  // --- 3. AGGREGATION & LEVIES ---
  // Sum up all dynamically calculated rider premiums
  // const sumOfRiders = calculatedRiders.reduce(
  //   (total, currentRider) => total + currentRider.premium,
  //   0,
  // );
  const sumOfRiders = calculatedRiders.reduce(
    (total, currentRider) => total + currentRider.premium.value,
    0,
  );

  // Gross Premium is the subtotal before regulatory taxes
  const grossPremium = {
    value: basicPremium.value + sumOfRiders,
    breakdown: {
      basicPremium: basicPremium.value,
      calculatedRiders: sumOfRiders,
    },
  };

  // IRA Mandated Levies (Calculated against Gross Premium, rounded to whole shillings)
  const itl = {
    value: Math.round(grossPremium.value * (LEVIES.ITL_RATE_BPS / 10000)),
    breakdown: {
      rateType: "PERCENTAGE_BPS" as const,
      rateValue: LEVIES.ITL_RATE_BPS,
      rawCalculation: grossPremium.value * (LEVIES.ITL_RATE_BPS / 10000),
    },
  };
  const phcf = {
    value: Math.round(grossPremium.value * (LEVIES.PHCF_RATE_BPS / 10000)),
    breakdown: {
      rateType: "PERCENTAGE_BPS" as const,
      rateValue: LEVIES.PHCF_RATE_BPS,
      rawCalculation: grossPremium.value * (LEVIES.PHCF_RATE_BPS / 10000),
    },
  };
  const stampDuty = {
    value: LEVIES.STAMP_DUTY_KES,
    breakdown: {
      rateType: "FLAT" as const,
      rateValue: LEVIES.STAMP_DUTY_KES,
      rawCalculation: LEVIES.STAMP_DUTY_KES,
    },
  };

  const totalPayable =
    grossPremium.value + itl.value + phcf.value + stampDuty.value;

  // --- 4. FINAL ASSEMBLY ---
  return {
    coverType,
    vehicleValue,
    basicPremium,
    calculatedRiders,
    grossPremium,
    itl,
    phcf,
    stampDuty,
    totalPayable,
  };
}
