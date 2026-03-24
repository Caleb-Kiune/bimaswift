import {
  CommercialInsuranceProduct,
  CommercialVehicleRequest,
  CommercialQuoteResult,
} from "../types/index";
import { activeCommercialProducts } from "../data/rates";

export default function calculatePremium(
  products: CommercialInsuranceProduct[],
  request: CommercialVehicleRequest,
): CommercialQuoteResult[] {
  return products
    .map((product) => {
      function calculateTpoBasePremium(
        product: CommercialInsuranceProduct,
        request: CommercialVehicleRequest,
      ) {
        const band = product.tpoBands.find(
          (band) =>
            band.usageType === request.usageType &&
            request.tonnage >= band.minTonnage &&
            request.tonnage <= band.maxTonnage,
        );
        if (!band) {
          throw new Error(
            `DECLINE: No rating band found for ${product.insurerName} with Tonnage: ${request.tonnage}`,
          );
        }

        return band.flatPremium;
      }

      function calculateComprehensiveBasePremium(
        product: CommercialInsuranceProduct,
        request: CommercialVehicleRequest,
      ) {
        const band = product.ratingBands.find(
          (band) =>
            band.usageType === request.usageType &&
            (band.minTonnage === undefined ||
              request.tonnage >= band.minTonnage) &&
            (band.maxTonnage === undefined ||
              request.tonnage <= band.maxTonnage) &&
            request.sumInsured! >= band.minVehicleValue &&
            request.sumInsured! <= band.maxVehicleValue,
        );
        if (!band) {
          throw new Error(
            `DECLINE: No rating band found for ${product.insurerName} with Tonnage: ${request.tonnage}`,
          );
        }
        return Math.max(
          Math.floor((request.sumInsured! * band.basicRateBps) / 10000),
          band.basicMinPremium,
        );
      }

      let basePremium: number;

      try {
        basePremium =
          request.coverType === "TPO"
            ? calculateTpoBasePremium(product, request)
            : calculateComprehensiveBasePremium(product, request);
      } catch (error) {
        return null;
      }

      function leviesCalculator(
        basePremium: number,
        product: CommercialInsuranceProduct,
      ) {
        const trainingLevy = Math.floor(
          (basePremium * product.levies.trainingLevyBps) / 10000,
        );
        const policyholdersFund = Math.floor(
          (basePremium * product.levies.policyholdersFundBps) / 10000,
        );
        const stampDuty = product.levies.stampDuty;
        return { trainingLevy, policyholdersFund, stampDuty };
      }

      const levies = leviesCalculator(basePremium, product);
      const totalLevies =
        levies.trainingLevy + levies.policyholdersFund + levies.stampDuty;

      const quote: CommercialQuoteResult = {
        insurerId: product.insurerId,
        insurerName: product.insurerName,
        basicPremium: basePremium,
        pllCharge: 0,
        riderPremiums: 0,
        levies: totalLevies,
        stampDuty: product.levies.stampDuty,
        totalPremium: basePremium + totalLevies,
        floorOverrodeDiscount: false,
        fleetDiscountApplied: false,
      };

      return quote;
    })
    .filter((quote) => quote !== null) as CommercialQuoteResult[];
}

const testRequest: CommercialVehicleRequest = {
  coverType: "TPO",
  tonnage: 55,
  usageType: "GENERAL_CARTAGE",
  isFleet: false,
  includePLL: false,
  sumInsured: 1500000,
};

const results = calculatePremium(activeCommercialProducts, testRequest);
console.log(JSON.stringify(results, null, 2));
