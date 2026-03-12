import { activeProducts, RatingBand } from "./data/insurers";

export default function calculateBasicPremium(
  vehicleValue: number,
  bands: RatingBand[],
): number {
  const correctBand = bands.find(
    (band) =>
      band.minVehicleValue <= vehicleValue &&
      band.maxVehicleValue >= vehicleValue,
  );

  if (!correctBand) {
    throw new Error("Vehicle value out of range");
  }

  const rate = correctBand.basicRateBps;
  const calculatedPremium = Math.round(vehicleValue * (rate / 10000));
  const basicPremium = Math.max(calculatedPremium, correctBand.basicMinPremium);

  return basicPremium;
}

const pioneerBands = activeProducts[0].ratingBands;

console.log(calculateBasicPremium(800000, pioneerBands)); 
console.log(calculateBasicPremium(1200000, pioneerBands)); 
console.log(calculateBasicPremium(500000, pioneerBands)); 
