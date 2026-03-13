// lib/data/insurers.ts

// 1. Core Types for our Pricing Engine
export type RateType = "FREE" | "FLAT" | "PERCENTAGE_BPS";
export type RiderType = "PVT" | "EXCESS_PROTECTOR" | "LOSS_OF_USE";

// 2. The Base Premium Tier
export interface RatingBand {
  minVehicleValue: number;
  maxVehicleValue: number; // e.g., 1500000. Next band MUST start at 1500001
  basicRateBps: number;    // e.g., 450 for 4.5%
  basicMinPremium: number; // e.g., 20000
}

// 3. The Rider Tier (For PVT, EP, etc.)
export interface RiderBand {
  minVehicleValue: number;
  maxVehicleValue: number;
  rateType: RateType;
  rateValue: number;       // If FREE, this is 0. If FLAT, it's a KES amount. If BPS, it's basis points.
  minPremium: number;      // e.g., 3000
}

// 4. The Rider Configuration
export interface TieredRider {
  id: string;              // e.g., "pioneer_pvt"
  type: RiderType;
  name: string;            // UI Display Name e.g., "Political Violence & Terrorism"
  isToggleable: boolean;   // Can the agent turn this off?
  bands: RiderBand[];
}

// 5. The Parent Product Record
export interface InsuranceProduct {
  id: string;
  insurerId: string;
  insurerName: string;     // e.g., "Pioneer Insurance"
  productName: string;     // e.g., "Private Comprehensive"
  tpoFlatPremium: number;  // The fallback flat rate if forced to TPO
  ratingBands: RatingBand[];
  riders: TieredRider[];
}

// ==========================================
// THE STATIC DATABASE (Single Source of Truth)
// ==========================================

export const activeProducts: InsuranceProduct[] = [
  // --- 1. PIONEER INSURANCE ---
  {
    id: "prod_pioneer_comp_01",
    insurerId: "ins_pioneer",
    insurerName: "Pioneer Insurance",
    productName: "Private Comprehensive",
    tpoFlatPremium: 7500,
    ratingBands: [
      { minVehicleValue: 0, maxVehicleValue: 1000000, basicRateBps: 600, basicMinPremium: 37500 },
      { minVehicleValue: 1000001, maxVehicleValue: 1499999, basicRateBps: 500, basicMinPremium: 37500 },
      { minVehicleValue: 1500000, maxVehicleValue: 2499999, basicRateBps: 400, basicMinPremium: 37500 },
      { minVehicleValue: 2500000, maxVehicleValue: 999999999, basicRateBps: 300, basicMinPremium: 37500 },
    ],
    riders: [
      {
        id: "pioneer_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 4000000, rateType: "FREE", rateValue: 0, minPremium: 0 },
          { minVehicleValue: 4000001, maxVehicleValue: 999999999, rateType: "PERCENTAGE_BPS", rateValue: 25, minPremium: 2500 },
        ],
      },
      {
        id: "pioneer_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 999999999, rateType: "PERCENTAGE_BPS", rateValue: 25, minPremium: 5000 },
        ],
      },
      {
        id: "pioneer_lou_10",
        type: "LOSS_OF_USE",
        name: "Loss of Use (10 Days)",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 999999999, rateType: "FLAT", rateValue: 4500, minPremium: 4500 },
        ],
      },
    ],
  },

  // --- 2. MONARCH INSURANCE ---
  {
    id: "prod_monarch_comp_01",
    insurerId: "ins_monarch",
    insurerName: "Monarch Insurance",
    productName: "Private Comprehensive",
    tpoFlatPremium: 7500,
    ratingBands: [
      { minVehicleValue: 0, maxVehicleValue: 1500000, basicRateBps: 400, basicMinPremium: 27500 },
      { minVehicleValue: 1500001, maxVehicleValue: 2000000, basicRateBps: 375, basicMinPremium: 27500 },
      { minVehicleValue: 2000001, maxVehicleValue: 2500000, basicRateBps: 350, basicMinPremium: 27500 },
      { minVehicleValue: 2500001, maxVehicleValue: 999999999, basicRateBps: 300, basicMinPremium: 27500 },
    ],
    riders: [
      {
        id: "monarch_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 999999999, rateType: "PERCENTAGE_BPS", rateValue: 25, minPremium: 2500 },
        ],
      },
      {
        id: "monarch_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 999999999, rateType: "PERCENTAGE_BPS", rateValue: 25, minPremium: 3000 },
        ],
      },
      {
        id: "monarch_lou",
        type: "LOSS_OF_USE",
        name: "Loss of Use (Max 30k Limit)",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 999999999, rateType: "FLAT", rateValue: 3000, minPremium: 3000 },
        ],
      },
    ],
  },

  // --- 3. GEMINIA INSURANCE ---
  {
    id: "prod_geminia_comp_01",
    insurerId: "ins_geminia",
    insurerName: "Geminia Insurance",
    productName: "Private Comprehensive",
    tpoFlatPremium: 7500,
    ratingBands: [
      { minVehicleValue: 0, maxVehicleValue: 1000000, basicRateBps: 600, basicMinPremium: 35000 },
      { minVehicleValue: 1000001, maxVehicleValue: 1500000, basicRateBps: 500, basicMinPremium: 35000 },
      { minVehicleValue: 1500001, maxVehicleValue: 2500000, basicRateBps: 400, basicMinPremium: 35000 },
      { minVehicleValue: 2500001, maxVehicleValue: 999999999, basicRateBps: 300, basicMinPremium: 35000 },
    ],
    riders: [
      {
        id: "geminia_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 1500000, rateType: "FREE", rateValue: 0, minPremium: 0 },
          { minVehicleValue: 1500001, maxVehicleValue: 999999999, rateType: "PERCENTAGE_BPS", rateValue: 25, minPremium: 2500 },
        ],
      },
      {
        id: "geminia_ep",
        type: "EXCESS_PROTECTOR",
        name: "Excess Protector",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 1500000, rateType: "PERCENTAGE_BPS", rateValue: 50, minPremium: 5000 },
          { minVehicleValue: 1500001, maxVehicleValue: 999999999, rateType: "PERCENTAGE_BPS", rateValue: 25, minPremium: 5000 },
        ],
      },
    ],
  },
];