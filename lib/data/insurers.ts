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
  id: string;              // e.g., "pioneer-pvt"
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
  {
    id: "prod_pioneer_comp_01",
    insurerId: "ins_pioneer",
    insurerName: "Pioneer Insurance",
    productName: "Private Comprehensive",
    tpoFlatPremium: 7500,
    ratingBands: [
      { minVehicleValue: 0, maxVehicleValue: 1000000, basicRateBps: 600, basicMinPremium: 37500 },        // Up to 1M (6%)
      { minVehicleValue: 1000001, maxVehicleValue: 1499999, basicRateBps: 500, basicMinPremium: 37500 },  // 1M - 1.49M (5%)
      { minVehicleValue: 1500000, maxVehicleValue: 2499999, basicRateBps: 400, basicMinPremium: 37500 },  // 1.5M - 2.49M (4%)
      { minVehicleValue: 2500000, maxVehicleValue: 999999999, basicRateBps: 300, basicMinPremium: 37500 },// 2.5M+ (3%)
    ],
    riders: [
      {
        id: "pioneer_pvt",
        type: "PVT",
        name: "Political Violence & Terrorism",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 4000000, rateType: "FREE", rateValue: 0, minPremium: 0 },
          { minVehicleValue: 4000001, maxVehicleValue: 999999999, rateType: "PERCENTAGE_BPS", rateValue: 25, minPremium: 2500 }, // Above 4M
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
      {
        id: "pioneer_lou_20",
        type: "LOSS_OF_USE",
        name: "Loss of Use (20 Days)",
        isToggleable: true,
        bands: [
          { minVehicleValue: 0, maxVehicleValue: 999999999, rateType: "FLAT", rateValue: 7500, minPremium: 7500 },
        ],
      },
    ],
  },
];