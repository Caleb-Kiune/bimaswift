import {
  CommercialInsuranceProduct,
  CommercialVehicleRequest,
  CommercialQuoteResult,
} from "../types/index";
import {
  calculateTpoBasePremium,
  calculateComprehensiveBasePremium,
  leviesCalculator,
  calculateRiders,
} from "../utils/calculatorUtils";

import { activeCommercialProducts } from "../data/rates";

export default function calculatePremium(
  products: CommercialInsuranceProduct[],
  request: CommercialVehicleRequest,
): CommercialQuoteResult[] {
  return products

    .map((product) => {
      // STEP 1: Route to the correct base premium helper
      const baseResult =
        request.coverType === "TPO"
          ? calculateTpoBasePremium(product, request)
          : calculateComprehensiveBasePremium(product, request);

      if (baseResult === null) return null;

      const basePremium = baseResult.premium;

      // STEP 2: Add Passenger Legal Liability (PLL)
      let pllCharge = 0;
      if (request.includePLL) {
        pllCharge = (request.passengerCount || 0) * product.pllPerPassenger;
      }

      // STEP 3: Add Optional Riders
      const riderResult = calculateRiders(product, request);
      const totalRiderPremium = riderResult.totalRiderPremium;

      const combinedPremium = basePremium + pllCharge + totalRiderPremium;

      // STEP 4: Calculate Levies & Taxes
      // Now returns a rich breakdown object
      const levyDetails = leviesCalculator(combinedPremium, product);

      // STEP 5: Assemble the Final Quote
      const quote: CommercialQuoteResult = {
        insurerId: product.insurerId,
        insurerName: product.insurerName,
        sumInsured: request.sumInsured,

        basicPremium: basePremium,
        pllCharge: pllCharge,
        riderPremiums: totalRiderPremium,
        totalLevies: levyDetails.totalLevies,
        stampDuty: product.levies.stampDuty,
        totalPremium: combinedPremium + levyDetails.totalLevies,

        basePremiumDetails: baseResult.breakdown,
        riderDetails: riderResult.riderDetails,
        levyDetails: levyDetails,

        floorOverrodeDiscount: baseResult.floorOverrodeDiscount,
        fleetDiscountApplied: baseResult.fleetDiscountApplied,
      };

      return quote;
    })
    .filter((quote) => quote !== null) as CommercialQuoteResult[];
}
