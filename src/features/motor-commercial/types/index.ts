/**
 * STRICT DOMAIN TYPES: COMMERCIAL MOTOR INSURANCE
 * By defining these exact shapes, we prevent runtime errors and ensure that 
 * the frontend form, the calculator engine, and the rate configuration 
 * all agree on the exact data contract.
 */

// ----------------------------------------------------------------------
// 1. ENUMS & STRICT LITERALS
// We use strict string literals instead of regular strings to prevent typos.
// E.g., if a developer types "GENERAL_CARTAGEE", TypeScript will throw an error.
// ----------------------------------------------------------------------
export type UsageCategory = "OWN_GOODS" | "GENERAL_CARTAGE";
export type CoverType = "COMPREHENSIVE" | "TPO";

// ----------------------------------------------------------------------
// 2. RATE CONFIGURATION INTERFACES (Used in rates.ts)
// ----------------------------------------------------------------------

/**
 * TPO (Third Party Only) Band
 * TPO is rated purely on the weight of the vehicle, not its value.
 */
export interface TpoBand {
  usageType: UsageCategory;
  minTonnage: number;
  maxTonnage: number;
  flatPremium: number;
  /** * Optional: Some insurers (like Geminia) offer a hardcoded flat rate discount for TPO fleets.
   * If an insurer does not offer this, we omit the field, and the calculator gracefully 
   * falls back to the standard flatPremium.
   */
  fleetPremium?: number; 
}

/**
 * COMPREHENSIVE Rating Band
 * This dictates how a comprehensive premium is calculated based on vehicle value and usage.
 */
export interface RatingBand {
  usageType: UsageCategory;
  minVehicleValue: number;
  maxVehicleValue: number;
  
  /**
   * Optional Tonnage Fields:
   * Most insurers only care about value for Comprehensive. However, NCBA has a complex rule 
   * where General Cartage minimum premiums increase based on tonnage. Making these optional 
   * allows us to handle NCBA's edge case without forcing dummy data onto other insurers.
   */
  minTonnage?: number; 
  maxTonnage?: number; 
  
  /**
   * Basis Points (BPS) for the percentage rate. 1 BPS = 0.01%. 
   * E.g., 450 BPS = 4.5%. We use integers to avoid JavaScript floating-point math bugs.
   */
  basicRateBps: number; 
  basicMinPremium: number;
  
  /**
   * Optional Fleet Minimum Premium:
   * Normally, fleets just get a % discount. But NCBA enforces a strict Ksh 100,000 floor 
   * for General Cartage fleets, overriding the normal 50k/75k minimums.
   */
  fleetMinPremium?: number;
}

/**
 * Rider Band (Add-ons like PVT, Excess Protector)
 * Riders can be charged as a percentage of the vehicle value, a flat fee, or free.
 */
export interface RiderBand {
  minVehicleValue: number;
  maxVehicleValue: number;
  rateType: "PERCENTAGE_BPS" | "FLAT" | "FREE";
  rateValue: number; // For flat fees, this is the exact amount. For BPS, it's the %.
  minPremium: number;
}

export interface Rider {
  id: string;
  type: "PVT" | "EXCESS_PROTECTOR" | "LOSS_OF_USE" | "ROAD_RESCUE";
  name: string;
  isToggleable: boolean; // Tells the React UI if the agent is allowed to uncheck this box
  bands: RiderBand[];
}

/**
 * THE PRODUCT BLUEPRINT
 * This is the master interface for an underwriter's commercial product offering.
 */
export interface CommercialInsuranceProduct {
  id: string;
  insurerId: string;
  insurerName: string;
  productName: string;
  
  /** The percentage drop in the base rate for fleets (e.g., 25 = 0.25% off) */
  fleetDiscountBps: number; 
  
  /** Passenger Legal Liability charge per passenger (Usually Ksh 500 in Kenya) */
  pllPerPassenger: number; 
  
  /** * Explicit Levies: Keeps statutory charges modular just in case an underwriter 
   * handles stamp duty internally or uses a different fund structure.
   */
  levies: {                
    trainingLevy: number;
    policyholdersFund: number;
    stampDuty: number;
  };
  tpoBands: TpoBand[];
  ratingBands: RatingBand[];
  riders: Rider[];
}

// ----------------------------------------------------------------------
// 3. I/O INTERFACES (The Input from User -> Output to UI)
// ----------------------------------------------------------------------

/**
 * THE INPUT CONTRACT (From the React Form)
 * Everything the agent submits must map exactly to this shape.
 */
export interface CommercialVehicleRequest {
  coverType: CoverType;
  /** Optional because TPO quotes do not require a vehicle valuation */
  sumInsured?: number; 
  tonnage: number;
  usageType: UsageCategory;
  isFleet: boolean;
  includePLL: boolean;
  /** Optional because PLL is not mandatory for Own Goods */
  passengerCount?: number;
  /** Array of rider type strings (e.g., ["PVT", "EXCESS_PROTECTOR"]) */
  selectedRiders?: string[];
}

/**
 * THE OUTPUT CONTRACT (To the Comparison Table)
 * This is what the calculator spits out. It is pre-formatted for easy React rendering.
 */
export interface CommercialQuoteResult {
  insurerId: string;
  insurerName: string;
  basicPremium: number;
  pllCharge: number;
  riderPremiums: number;
  levies: number;
  stampDuty: number;
  totalPremium: number;
  
  /** * UX FLAG: Tells the UI to render a warning badge ("Min Premium Applied").
   * Avoids having to recalculate business logic inside the React component.
   */
  floorOverrodeDiscount: boolean; 
  
  /** UX FLAG: Tells the UI to render a success badge ("Fleet Discount Applied") */
  fleetDiscountApplied: boolean; 
}