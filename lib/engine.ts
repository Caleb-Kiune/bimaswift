interface MotorPremiumRates {
  basicRateBps: number;
  basicMinPremium: number;
  pvtRateBps: number;
  pvtMinPremium: number;
  tpoFlatPremium: number;
}

interface MotorLevies {
  itlRateBps: number;
  phcfRateBps: number;
  stampDuty: number;
}

interface QuoteBreakdown {
  basicPremium: number;
  pvt: number;
  grossPremium: number;
  itl: number;
  phcf: number;
  stampDuty: number;
  totalPayable: number;
}

export default function calculateMotorPremium(
  vehicleValue: number,
  coverType: "COMPREHENSIVE" | "TPO",
  rates: MotorPremiumRates,
): QuoteBreakdown {
    
  //Initialize variables
  let basicPremium = 0;
  let pvtPremium = 0;

  //Levies
  const levies: MotorLevies = {
    itlRateBps: 20,
    phcfRateBps: 25,
    stampDuty: 40,
  };
  

  if (coverType === "COMPREHENSIVE") {
    //Compute Comprehensive
    basicPremium = Math.max(
      Math.round(vehicleValue * (rates.basicRateBps / 10000)),
      rates.basicMinPremium,
    );

    pvtPremium = Math.max(
      Math.round(vehicleValue * (rates.pvtRateBps / 10000)),
      rates.pvtMinPremium,
    );
  } else if (coverType === "TPO") {
    //Compute TPO
    basicPremium = rates.tpoFlatPremium;

    pvtPremium = 0;
  }

  //Compute Gross Premium
  const grossPremium = basicPremium + pvtPremium;

  // Add levies
  const itl = Math.round(grossPremium * (levies.itlRateBps / 10000));
  const phcf = Math.round(grossPremium * (levies.phcfRateBps / 10000));

  //Compute Total Payable
  const totalPayable = grossPremium + itl + phcf + levies.stampDuty;

  //Return Quote Breakdown
  return {
    basicPremium,
    pvt: pvtPremium,
    grossPremium,
    itl,
    phcf,
    stampDuty: levies.stampDuty,
    totalPayable,
  };
}

console.log(
  calculateMotorPremium(2000000, "TPO", {
    basicRateBps: 450,
    basicMinPremium: 20000,
    pvtRateBps: 25,
    pvtMinPremium: 3000,
    tpoFlatPremium: 7500,
  }),
);

console.log(
  calculateMotorPremium(2000000, "COMPREHENSIVE", {
    basicRateBps: 450,
    basicMinPremium: 20000,
    pvtRateBps: 25,
    pvtMinPremium: 3000,
    tpoFlatPremium: 7500,
  }),
);
