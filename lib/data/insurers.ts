import { InsuranceProduct } from "@/types";

export const activeProducts: InsuranceProduct[] = [
  // --- 1. PIONEER INSURANCE ---
  {
    id: "prod_pioneer_comp_01",
    insurerId: "ins_pioneer",
    insurerName: "Pioneer Insurance",
    productName: "Private Comprehensive",
    tpoFlatPremium: 7500,
    ratingBands: [
      {
        minVehicleValue: 0,
        maxVehicleValue: 1000000,
        basicRateBps: 600,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 1000001,
        maxVehicleValue: 1499999,
        basicRateBps: 500,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 1500000,
        maxVehicleValue: 2499999,
        basicRateBps: 400,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 2500000,
        maxVehicleValue: 999999999,
        basicRateBps: 300,
        basicMinPremium: 37500,
      },
    ],
    riders: [
      {
        id: "pioneer_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 4000000,
            rateType: "FREE",
            rateValue: 0,
            minPremium: 0,
          },
          {
            minVehicleValue: 4000001,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 2500,
          },
        ],
      },
      {
        id: "pioneer_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 5000,
          },
        ],
      },
      {
        id: "pioneer_lou",
        type: "LOSS_OF_USE",
        name: "Loss of Use / Courtesy Car",
        isToggleable: true,
        bands: [],
        options: [
          {
            id: "lou_10",
            label: "10 Days (Limit: KES 30,000)",
            premium: 4500,
          },
          {
            id: "lou_20",
            label: "20 Days (Limit: KES 60,000)",
            premium: 7500,
          },
        ],
        meta: {
          description:
            "Provides a replacement vehicle while yours is being repaired.",
        },
      },
    ],
  },

  // --- 2. MONARCH INSURANCE ---
  {
    id: "prod_monarch_comp_01",
    insurerId: "ins_monarch",
    insurerName: "Monarch Insurance",
    productName: "Private Comprehensive",
    tpoFlatPremium: 3700,
    ratingBands: [
      {
        minVehicleValue: 0,
        maxVehicleValue: 1500000,
        basicRateBps: 400,
        basicMinPremium: 27500,
      },
      {
        minVehicleValue: 1500001,
        maxVehicleValue: 2000000,
        basicRateBps: 375,
        basicMinPremium: 27500,
      },
      {
        minVehicleValue: 2000001,
        maxVehicleValue: 2500000,
        basicRateBps: 350,
        basicMinPremium: 27500,
      },
      {
        minVehicleValue: 2500001,
        maxVehicleValue: 999999999,
        basicRateBps: 300,
        basicMinPremium: 27500,
      },
    ],
    riders: [
      {
        id: "monarch_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 2500,
          },
        ],
      },
      {
        id: "monarch_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 3000,
          },
        ],
      },
      {
        id: "monarch_lou",
        type: "LOSS_OF_USE",
        name: "Loss of Use / Courtesy Car",
        isToggleable: true,
        bands: [],
        options: [
          {
            id: "lou_10",
            label: "10 Days (Limit: KES 30,000)",
            premium: 3000,
          },
        ],
        meta: {
          description:
            "Provides a replacement vehicle while yours is being repaired.",
        },
      },
    ],
  },

  // --- 3. GEMINIA INSURANCE ---
  {
    id: "prod_geminia_comp_01",
    insurerId: "ins_geminia",
    insurerName: "Geminia Insurance",
    productName: "Private Comprehensive",
    tpoFlatPremium: 12000,
    ratingBands: [
      {
        minVehicleValue: 0,
        maxVehicleValue: 1000000,
        basicRateBps: 600,
        basicMinPremium: 35000,
      },
      {
        minVehicleValue: 1000001,
        maxVehicleValue: 1500000,
        basicRateBps: 500,
        basicMinPremium: 35000,
      },
      {
        minVehicleValue: 1500001,
        maxVehicleValue: 2500000,
        basicRateBps: 400,
        basicMinPremium: 35000,
      },
      {
        minVehicleValue: 2500001,
        maxVehicleValue: 999999999,
        basicRateBps: 300,
        basicMinPremium: 35000,
      },
    ],
    riders: [
      {
        id: "geminia_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 1500000,
            rateType: "FREE",
            rateValue: 0,
            minPremium: 0,
          },
          {
            minVehicleValue: 1500001,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 2500,
          },
        ],
      },
      {
        id: "geminia_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 1500000,
            rateType: "PERCENTAGE_BPS",
            rateValue: 50,
            minPremium: 5000,
          },
          {
            minVehicleValue: 1500001,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 5000,
          },
        ],
      },
    ],
  },

  // --- 4. CIC GROUP INSURANCE ---
  {
    id: "prod_cic_comp_01",
    insurerId: "ins_cic",
    insurerName: "CIC Group",
    productName: "Private Comprehensive",
    tpoFlatPremium: 7500,
    ratingBands: [
      {
        minVehicleValue: 0,
        maxVehicleValue: 1000000,
        basicRateBps: 600,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 1000001,
        maxVehicleValue: 1500000,
        basicRateBps: 500,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 1500001,
        maxVehicleValue: 2500000,
        basicRateBps: 400,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 2500001,
        maxVehicleValue: 3000000,
        basicRateBps: 300,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 3000001,
        maxVehicleValue: 5000000,
        basicRateBps: 325,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 5000001,
        maxVehicleValue: 999999999,
        basicRateBps: 300,
        basicMinPremium: 37500,
      },
    ],
    riders: [
      {
        id: "cic_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 3000000,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 2500,
          },
          {
            minVehicleValue: 3000001,
            maxVehicleValue: 999999999,
            rateType: "FREE",
            rateValue: 0,
            minPremium: 0,
          },
        ],
      },
      {
        id: "cic_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 3000000,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 5000,
          },
          {
            minVehicleValue: 3000001,
            maxVehicleValue: 999999999,
            rateType: "FREE",
            rateValue: 0,
            minPremium: 0,
          },
        ],
      },
    ],
  },

  // --- 5. NCBA INSURANCE ---
  {
    id: "prod_ncba_comp_01",
    insurerId: "ins_ncba",
    insurerName: "NCBA Insurance",
    productName: "Private Comprehensive",
    tpoFlatPremium: 12000,
    ratingBands: [
      {
        minVehicleValue: 0,
        maxVehicleValue: 1000000,
        basicRateBps: 630,
        basicMinPremium: 37500,
      },
      {
        minVehicleValue: 1000001,
        maxVehicleValue: 1500000,
        basicRateBps: 510,
        basicMinPremium: 60000,
      },
      {
        minVehicleValue: 1500001,
        maxVehicleValue: 2500000,
        basicRateBps: 400,
        basicMinPremium: 75000,
      },
      {
        minVehicleValue: 2500001,
        maxVehicleValue: 3000000,
        basicRateBps: 350,
        basicMinPremium: 100000,
      },
      {
        minVehicleValue: 3000001,
        maxVehicleValue: 5000000,
        basicRateBps: 350,
        basicMinPremium: 100000,
      },
      {
        minVehicleValue: 5000001,
        maxVehicleValue: 999999999,
        basicRateBps: 300,
        basicMinPremium: 175000,
      },
    ],
    riders: [
      {
        id: "ncba_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 2500,
          },
        ],
      },
      {
        id: "ncba_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 3000000,
            rateType: "PERCENTAGE_BPS",
            rateValue: 25,
            minPremium: 2500,
          },
          {
            minVehicleValue: 3000001,
            maxVehicleValue: 999999999,
            rateType: "FREE",
            rateValue: 0,
            minPremium: 0,
          },
        ],
      },
      {
        id: "ncba_lou",
        type: "LOSS_OF_USE",
        name: "Loss of Use / Courtesy Car",
        isToggleable: true,
        bands: [],
        options: [
          {
            id: "lou_10",
            label: "10 Days (Limit: 10k/day - Premier >3M)",
            premium: 8000,
          },
          {
            id: "lou_15",
            label: "15 Days (Limit: 3k/day)",
            premium: 4000,
          },
          {
            id: "lou_20",
            label: "20 Days (Limit: 5k/day - Premier >3M)",
            premium: 6000,
          },
          {
            id: "lou_30",
            label: "30 Days (Limit: 3k/day)",
            premium: 6000,
          },
        ],
        meta: {
          description:
            "Provides a replacement vehicle while yours is being repaired.",
        },
      },
      {
        id: "ncba_rr",
        type: "ROAD_RESCUE",
        name: "Road Rescue (AAK Membership)",
        isToggleable: true,
        bands: [
          {
            minVehicleValue: 0,
            maxVehicleValue: 999999999,
            rateType: "FLAT",
            rateValue: 5000,
            minPremium: 5000,
          },
        ],
      },
    ],
  },
];
