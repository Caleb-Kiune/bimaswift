import {
  activeProducts,
  RatingBand,
  TieredRider,
  InsuranceProduct,
} from "./data/insurers";

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
    throw new Error("Vehicle value out of range");
  }

  const rate = correctRatingBand.basicRateBps;
  const calculatedPremium = Math.round(vehicleValue * (rate / 10000));
  const basicPremium = Math.max(
    calculatedPremium,
    correctRatingBand.basicMinPremium,
  );

  return basicPremium;
}

const pioneerBands = activeProducts[0].ratingBands;

// console.log(calculateBasicPremium(800000, pioneerBands));
// console.log(calculateBasicPremium(1200000, pioneerBands));
// console.log(calculateBasicPremium(500000, pioneerBands));

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
    throw new Error("Vehicle value out of range" + rider.name);
  }

  const rateType = correctRiderBand.rateType;
  const rateValue = correctRiderBand.rateValue;
  const minPremium = correctRiderBand.minPremium;

  let riderPremium = 0;

  if (rateType === "FREE") {
    riderPremium = 0;
  } else if (rateType === "FLAT") {
    riderPremium = rateValue;
  } else if (rateType === "PERCENTAGE_BPS") {
    riderPremium = Math.round(vehicleValue * (rateValue / 10000));
    riderPremium = Math.max(riderPremium, minPremium);
  }

  return riderPremium;
}

const pioneerPVT = activeProducts[0].riders.find((r) => r.type === "PVT")!;
const pioneerLOU = activeProducts[0].riders.find(
  (r) => r.type === "LOSS_OF_USE",
)!;
const pioneerEP = activeProducts[0].riders.find(
  (r) => r.type === "EXCESS_PROTECTOR",
)!;

// // PVT Tests
// console.log(calculateRiderPremium(2000000, pioneerPVT)); // Test D: Under 4M should be 0 since all vehicles under 4m are free pvt
// console.log(calculateRiderPremium(5000000, pioneerPVT)); // Test E: Over 4M should hit 25bps (12500)

// // Loss of Use Test/courtesy car
// console.log(calculateRiderPremium(2000000, pioneerLOU)); // Test F: Flat rate (Should be 4500)

// // Excess Protector Test
// console.log(calculateRiderPremium(2000000, pioneerEP)); // Test G: Below Minimum premium(Should be 5000)
// console.log(calculateRiderPremium(6000000, pioneerEP)); // Test H: Above Minimum premium(Should be 125000)

export interface CalculatedRider {
  id: string;
  name: string;
  premium: number;
}

export interface QuoteBreakdown {
  basicPremium: number;
  calculatedRiders: CalculatedRider[];
  grossPremium: number;
  itl: number;
  phcf: number;
  stampDuty: number;
  totalPayable: number;
}

export default function calculateMotorPremium(
  vehicleValue: number,
  coverType: "COMPREHENSIVE" | "TPO",
  product: InsuranceProduct,
  selectedRiderIds: string[]
): QuoteBreakdown {
  
  // THE BOXES WE WILL RETURN AT THE END
  let basicPremium = 0;
  let calculatedRiders: CalculatedRider[] = []; 


  
  //basic premium calculation
  if (coverType === "TPO") {
   
    basicPremium = product.tpoFlatPremium; 
    
  } else if (coverType === "COMPREHENSIVE") {
  
    basicPremium = calculateBasicPremium(vehicleValue, product.ratingBands);

    //Loop over the IDs the user selected 
    for (const riderId of selectedRiderIds) {
      const rider = product.riders.find((r) => r.id === riderId);

      if (rider) {
        //Do the math for THIS specific rider
        const premiumForThisRider = calculateRiderPremium(vehicleValue, rider);

        // 4. Push the result into our calculatedRiders box
        calculatedRiders.push({
          id: rider.id,
          name: rider.name,
          premium: premiumForThisRider
        });
      }
    }
  }

  
  //sum of all the rider premiums
  const sumOfRiders = calculatedRiders.reduce((total, currentRider) => total + currentRider.premium, 0);

  //Calculate Gross Premium
  const grossPremium = basicPremium + sumOfRiders;

 
 //add levies
  const itl = Math.round(grossPremium * (20 / 10000)); 
  
  
  const phcf = Math.round(grossPremium * (25 / 10000)); 
  

  const stampDuty = 40; 

  const totalPayable = grossPremium + itl + phcf + stampDuty; 

  //final QuoteBreakdown out the door!
  return {
    basicPremium,
    calculatedRiders,
    grossPremium,
    itl,
    phcf,
    stampDuty,
    totalPayable
  };
}



const pioneerProduct = activeProducts[0];

const finalQuote = calculateMotorPremium(
  2000000, 
  "COMPREHENSIVE", 
  pioneerProduct, 
  ["pioneer_pvt", "pioneer_ep", "pioneer_lou_10"]
);

console.log(JSON.stringify(finalQuote, null, 2));