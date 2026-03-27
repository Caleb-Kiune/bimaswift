import {
  CommercialInsuranceProduct,
  CommercialVehicleRequest,
  CommercialQuoteResult,
} from "../types/index";
import { activeCommercialProducts } from "../data/rates";
import {
  calculateTpoBasePremium,
  calculateComprehensiveBasePremium,
  leviesCalculator,
} from "../utils/calculatorUtils";

export default function calculatePremium(
  products: CommercialInsuranceProduct[],
  request: CommercialVehicleRequest,
): CommercialQuoteResult[] {
  // STEP 1: Loop through every insurer in the database
  return (
    products
      .map((product) => {
        // Step 2: Route to the correct helper function
        const basePremium =
          request.coverType === "TPO"
            ? calculateTpoBasePremium(product, request)
            : calculateComprehensiveBasePremium(product, request);

        // If the helper returned null (decline), stop here and return null for this quote
        if (basePremium === null) return null;

        // STEP 3: Add Passenger Legal Liability (PLL)
        let pllCharge = 0;
        if (request.includePLL) {
          pllCharge = (request.passengerCount || 0) * product.pllPerPassenger;
        }

        // STEP 4: Add Optional Riders (PVT, Excess Protector)
        let totalRiderPremium = 0;

        if (
          request.coverType === "COMPREHENSIVE" &&
          request.sumInsured &&
          request.selectedRiders &&
          request.selectedRiders.length > 0
        ) {
          request.selectedRiders.forEach((riderId) => {
            // Find the rider config for this specific insurer
            const productRider = product.riders?.find(
              (r) => r.type === riderId,
            );

            if (productRider) {
              // Hardcoded to only ever look at the first band of the rider
              const band = productRider.bands[0];

              if (band.rateType === "PERCENTAGE_BPS") {
                // Calculate rider premium based on total vehicle value
                const calculatedRider = Math.floor(
                  (request.sumInsured! * band.rateValue) / 10000,
                );

                // Enforce the rider's minimum premium rule (e.g. Min 5000)
                const finalRiderPremium = Math.max(
                  calculatedRider,
                  band.minPremium,
                );
                totalRiderPremium += finalRiderPremium;
              }
            }
          });
        }

        // Add everything up before statutory taxes
        const combinedPremium = basePremium + pllCharge + totalRiderPremium;

        // STEP 5: Calculate Levies & Taxes

        const levies = leviesCalculator(combinedPremium, product);
        const totalLevies =
          levies.trainingLevy + levies.policyholdersFund + levies.stampDuty;

        // STEP 6: Assemble the Final Quote
        const quote: CommercialQuoteResult = {
          insurerId: product.insurerId,
          insurerName: product.insurerName,
          basicPremium: basePremium,
          pllCharge: pllCharge,
          riderPremiums: totalRiderPremium,
          levies: totalLevies,
          stampDuty: product.levies.stampDuty,
          totalPremium: combinedPremium + totalLevies,
          floorOverrodeDiscount: false, // Currently hardcoded
          fleetDiscountApplied: false, // Currently hardcoded
        };

        return quote;
      })

      // STEP 7: Filter out the failed quotes
      // Removes all the "null" values returned by the try/catch block
      .filter((quote) => quote !== null) as CommercialQuoteResult[]
  );
}

