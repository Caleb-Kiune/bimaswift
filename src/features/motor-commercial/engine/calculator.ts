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


// ======================================================================
// REAL DATA TERMINAL TEST (APPENDED TO BOTTOM)
// ======================================================================

// 1. IMPORT YOUR REAL DATA (Fixed the variable name!)
import { activeCommercialProducts } from "../data/rates"; 

const testRequest = {
  coverType: "TPO",
  tonnage: 3,
  usageType: "GENERAL_CARTAGE",
  isFleet: false,
  includePLL: false,
} as any;

// 2. RUN THE ENGINE WITH REAL DATA
const results = calculatePremium(activeCommercialProducts, testRequest);

console.log("\n--- REAL PRODUCTS: TPO QUOTE RESULTS ---");

if (results && results.length > 0) {
  console.log(`Found quotes from ${results.length} underwriters:`);
  results.forEach(quote => {
    console.log(`- ${quote.insurerName}: Rate Value = ${quote.basePremiumDetails.rateValue}, Total = KES ${quote.totalPremium}`);
  });

  console.log("\n--- FULL JSON OF FIRST QUOTE ---");
  console.log(JSON.stringify(results[0], null, 2));
} else {
  console.log("No quotes generated! None of your actual products matched 3 tonnes, GENERAL_CARTAGE, TPO.");
}
console.log("-----------------------------------------\n");