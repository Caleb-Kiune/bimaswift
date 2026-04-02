import { CommercialInsuranceProduct } from "../types";

/**
 * SINGLE SOURCE OF TRUTH: COMMERCIAL MOTOR RATES
 * * Why this structure?
 * 1. In-Memory Speed: Reading from a TS array is instantaneous (<1ms) compared to database queries.
 * 2. Type Safety: By strictly typing this with CommercialInsuranceProduct, the compiler will yell
 * if we forget a mandatory field (like a base rate) for a new insurer.
 * 3. Avoiding Anti-Patterns: We don't store these bands in the database yet to avoid the
 * "Dual Source of Truth" problem (where the DB and the code get out of sync).
 */
export const activeCommercialProducts: CommercialInsuranceProduct[] = [
  // ==========================================
  // 1. NCBA INSURANCE
  // ==========================================
  {
    id: "prod_ncba_comm_01",
    insurerId: "ins_ncba",
    insurerName: "NCBA Insurance",
    productName: "Commercial Hybrid",

    // WHY BPS (Basis Points)?
    // We use integers (25) instead of floats (0.0025) for rates.
    // 1 Basis Point = 0.01%. So 25 BPS = 0.25%.
    // This is a standard financial engineering practice to prevent JavaScript floating-point math errors.

    // Passenger Legal Liability is explicitly defined per insurer.
    pllPerPassenger: 500,

    // Explicit Levies: Even though Kenyan levies are statutory, hardcoding them
    // globally is dangerous. Some specialty underwriters absorb stamp duty,
    // or apply different fund structures. Keeping it explicit per product is safer.
    levies: {
      trainingLevyBps: 20,
      policyholdersFundBps: 25,
      stampDuty: 40,
    },

    // TPO (Third Party Only) is rated purely on Tonnage and Usage.
    // Notice NCBA does not have a 'fleetPremium' field here because they
    // don't explicitly offer a flat TPO fleet discount in their rate card.
    tpoBands: [
      {
        usageType: "OWN_GOODS",
        minTonnage: 0,
        maxTonnage: 3,
        flatPremium: 12000,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 3.01,
        maxTonnage: 8,
        flatPremium: 15000,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 8.01,
        maxTonnage: 15,
        flatPremium: 20000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 0,
        maxTonnage: 3,
        flatPremium: 20000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 3.01,
        maxTonnage: 15,
        flatPremium: 25000,
      },
    ],

    // RATING BANDS (Comprehensive)
    ratingBands: [
      {
        usageType: "OWN_GOODS",
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 500, // 5% base rate
        fleetRateBps: 475,
        basicMinPremium: 50000,
        fleetMinPremium: 50000,
        // Notice there is NO min/max tonnage here.
        // Because those fields are 'optional' in our interface, we don't have to
        // write redundant code if the insurer doesn't care about tonnage for Own Goods.
      },
      // NCBA General Cartage relies heavily on Tonnage for its Minimum Premiums.
      // By making tonnage optional in the interface, we can gracefully handle NCBA's
      // strict tonnage brackets here without breaking the cleaner "Own Goods" band above.
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 0,
        maxTonnage: 3,
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 700, // 7% base rate
        fleetRateBps: 675,
        basicMinPremium: 50000,
        fleetMinPremium: 100000, // Explicitly handles NCBA's harsh fleet floor rule
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 3.01,
        maxTonnage: 8,
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 700,
        fleetRateBps: 675,
        basicMinPremium: 75000,
        fleetMinPremium: 100000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 8.01,
        maxTonnage: 999, // 999 acts as an artificial ceiling for "above 8 tons"
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 700,
        fleetRateBps: 675,
        basicMinPremium: 100000,
        fleetMinPremium: 100000,
      },
    ],

    // OPTIONAL ADD-ONS (Riders)
    // Structured as an array so the frontend can easily loop through them to create checkboxes.
    riders: [
      {
        id: "ncba_comm_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 45,
            minPremium: 5000,
          },
        ],
      },
      {
        id: "ncba_comm_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 50,
            minPremium: 5000,
          },
        ],
      },
    ],
  },

  // ==========================================
  // 2. GEMINIA INSURANCE
  // ==========================================
  {
    id: "prod_geminia_comm_01",
    insurerId: "ins_geminia",
    insurerName: "Geminia Insurance",
    productName: "Commercial Standard",

    // Geminia evaluates corporate fleets manually, so we set their automatic discount to 0.
    pllPerPassenger: 500,
    levies: {
      trainingLevyBps: 20,
      policyholdersFundBps: 25,
      stampDuty: 40,
    },

    // Notice the difference here vs NCBA: Geminia has explicit 'fleetPremium' flat rates
    // for TPO. Our interface handles both scenarios beautifully.
    tpoBands: [
      {
        usageType: "OWN_GOODS",
        minTonnage: 0,
        maxTonnage: 3,
        flatPremium: 12000,
        fleetPremium: 10000,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 3.01,
        maxTonnage: 8,
        flatPremium: 15000,
        fleetPremium: 12500,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 8.01,
        maxTonnage: 999,
        flatPremium: 20000,
        fleetPremium: 18000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 0,
        maxTonnage: 8,
        flatPremium: 20000,
        fleetPremium: 15000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 8.01,
        maxTonnage: 20,
        flatPremium: 25000,
        fleetPremium: 20000,
      },
    ],

    ratingBands: [
      {
        usageType: "OWN_GOODS",
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 450,
        basicMinPremium: 35000,
        // No fleetMinPremium declared here, so the calculator will automatically
        // fall back to the basicMinPremium (35000) for fleets.
      },
      {
        usageType: "GENERAL_CARTAGE",
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 550,
        basicMinPremium: 75000,
      },
    ],
    riders: [
      {
        id: "geminia_comm_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 35,
            minPremium: 3000,
          },
        ],
      },
      {
        id: "geminia_comm_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 50,
            minPremium: 5000,
          },
        ],
      },
    ],
  },

  // ==========================================
  // 3. CIC GROUP
  // ==========================================
  {
    id: "prod_cic_comm_01",
    insurerId: "ins_cic",
    insurerName: "CIC Group",
    productName: "Motor Commercial Hybrid",

    pllPerPassenger: 500,

    levies: {
      trainingLevyBps: 20,
      policyholdersFundBps: 25,
      stampDuty: 40,
    },

    tpoBands: [
      {
        usageType: "OWN_GOODS",
        minTonnage: 0,
        maxTonnage: 3,
        flatPremium: 15000,
        fleetPremium: 12000,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 3.01,
        maxTonnage: 8,
        flatPremium: 17000,
        fleetPremium: 15000,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 8.01,
        maxTonnage: 20,
        flatPremium: 20000,
        fleetPremium: 17500,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 20.01,
        maxTonnage: 30,
        flatPremium: 25000,
        fleetPremium: 20000,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 30.01,
        maxTonnage: 999,
        flatPremium: 25000,
        fleetPremium: 22500,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 0,
        maxTonnage: 3,
        flatPremium: 15000,
        fleetPremium: 12000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 3.01,
        maxTonnage: 8,
        flatPremium: 17000,
        fleetPremium: 15000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 8.01,
        maxTonnage: 20,
        flatPremium: 20000,
        fleetPremium: 17500,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 20.01,
        maxTonnage: 30,
        flatPremium: 25000,
        fleetPremium: 20000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 30.01,
        maxTonnage: 999,
        flatPremium: 25000,
        fleetPremium: 22500,
      },
    ],

    ratingBands: [
      {
        usageType: "OWN_GOODS",
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 500, // 5% base rate
        basicMinPremium: 50000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 500,
        basicMinPremium: 50000,
      },
    ],

    riders: [],
  },

  // ==========================================
  // 4. PIONEER GENERAL
  // ==========================================
  {
    id: "prod_pioneer_comm_01",
    insurerId: "ins_pioneer",
    insurerName: "Pioneer General",
    productName: "Motor Commercial Hybrid",

    pllPerPassenger: 500,

    levies: {
      trainingLevyBps: 20,
      policyholdersFundBps: 25,
      stampDuty: 40,
    },

    tpoBands: [],

    ratingBands: [
      {
        usageType: "OWN_GOODS",
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 500,
        fleetRateBps: 475,
        basicMinPremium: 50000,
        fleetMinPremium: 50000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minVehicleValue: 0,
        maxVehicleValue: 999999999,
        basicRateBps: 500,
        fleetRateBps: 475,
        basicMinPremium: 50000,
        fleetMinPremium: 50000,
      },
    ],

    riders: [
      {
        id: "pioneer_comm_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 50, 
            minPremium: 5000,
          },
        ],
      },
      {
        id: "pioneer_comm_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            // Band 1: Free up to 4 Million
            minVehicleValue: 0,
            maxVehicleValue: 4000000,
            rateType: "FREE",
            rateValue: 0,
            minPremium: 0,
          },
          {
            // Band 2: 0.25% for values above 4 Million
            minVehicleValue: 4000001,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25, 
            minPremium: 2500,
          },
        ],
      },
    ],
  },

  // ==========================================
  // 5. MONARCH INSURANCE
  // ==========================================
  {
    id: "prod_monarch_comm_01",
    insurerId: "ins_monarch",
    insurerName: "Monarch Insurance",
    productName: "Commercial Motor",

    pllPerPassenger: 500,

    levies: {
      trainingLevyBps: 20,
      policyholdersFundBps: 25,
      stampDuty: 40,
    },

    tpoBands: [
      {
        usageType: "OWN_GOODS",
        minTonnage: 0,
        maxTonnage: 3,
        flatPremium: 4500,
        fleetPremium: 4500,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 3.01,
        maxTonnage: 8,
        flatPremium: 5500,
        fleetPremium: 5500,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 8.01,
        maxTonnage: 12,
        flatPremium: 6500,
        fleetPremium: 6500,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 12.01,
        maxTonnage: 15,
        flatPremium: 7500,
        fleetPremium: 7500,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 15.01,
        maxTonnage: 20,
        flatPremium: 10000,
        fleetPremium: 10000,
      },
      {
        usageType: "OWN_GOODS",
        minTonnage: 20.01,
        maxTonnage: 999,
        flatPremium: 15000,
        fleetPremium: 15000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 0,
        maxTonnage: 3,
        flatPremium: 4500,
        fleetPremium: 4500,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 3.01,
        maxTonnage: 8,
        flatPremium: 5500,
        fleetPremium: 5500,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 8.01,
        maxTonnage: 12,
        flatPremium: 6500,
        fleetPremium: 6500,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 12.01,
        maxTonnage: 15,
        flatPremium: 7500,
        fleetPremium: 7500,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 15.01,
        maxTonnage: 20,
        flatPremium: 10000,
        fleetPremium: 10000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minTonnage: 20.01,
        maxTonnage: 999,
        flatPremium: 15000,
        fleetPremium: 15000,
      },
    ],

    ratingBands: [
      {
        usageType: "OWN_GOODS",
        minVehicleValue: 500000,
        maxVehicleValue: 1500000,
        basicRateBps: 400,
        basicMinPremium: 30000,
      },
      {
        usageType: "OWN_GOODS",
        minVehicleValue: 1500001,
        maxVehicleValue: 2000000,
        basicRateBps: 375,
        basicMinPremium: 30000,
      },
      {
        usageType: "OWN_GOODS",
        minVehicleValue: 2000001,
        maxVehicleValue: 2500000,
        basicRateBps: 350,
        basicMinPremium: 30000,
      },
      {
        usageType: "OWN_GOODS",
        minVehicleValue: 2500001,
        maxVehicleValue: 999999999,
        basicRateBps: 300,
        basicMinPremium: 30000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minVehicleValue: 500000,
        maxVehicleValue: 1500000,
        basicRateBps: 400,
        basicMinPremium: 30000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minVehicleValue: 1500001,
        maxVehicleValue: 2000000,
        basicRateBps: 400,
        basicMinPremium: 30000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minVehicleValue: 2000001,
        maxVehicleValue: 2500000,
        basicRateBps: 400,
        basicMinPremium: 30000,
      },
      {
        usageType: "GENERAL_CARTAGE",
        minVehicleValue: 2500001,
        maxVehicleValue: 999999999,
        basicRateBps: 375,
        basicMinPremium: 30000,
      },
    ],

    riders: [
      {
        id: "monarch_comm_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 35, // 0.35%
            minPremium: 3500,
          },
        ],
      },
      {
        id: "monarch_comm_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 50, // 0.5%
            minPremium: 5000,
          },
        ],
      },
    ],
  },
];



