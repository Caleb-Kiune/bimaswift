import { calculateBasicPremium } from "./calculator";
import { describe, it, expect } from "vitest";

describe("calculateBasicPremium - Comprehensive Suite", () => {
  // ARRANGE: A robust set of bands covering cheap, average, and luxury vehicles
  const mockBands = [
    { 
      minVehicleValue: 0, 
      maxVehicleValue: 1500000, 
      basicRateBps: 450, // 4.5%
      basicMinPremium: 50000 
    },
    { 
      minVehicleValue: 1500001, 
      maxVehicleValue: 5000000, 
      basicRateBps: 400, // 4.0%
      basicMinPremium: 60000 
    },
    { 
      minVehicleValue: 5000001, 
      maxVehicleValue: 10000000, 
      basicRateBps: 350, // 3.5%
      basicMinPremium: 175000 
    }
  ];

  it("Case 1: Standard calculation well above the minimum floor (Band 2)", () => {
    // 2,000,000 * 4.0% = 80,000. (Minimum is 60k).
    const result = calculateBasicPremium(2000000, mockBands);
    
    expect(result.value).toBe(80000);
    expect(result.breakdown.isMinPremiumApplied).toBe(false);
    expect(result.breakdown.rawCalculation).toBe(80000);
    expect(result.breakdown.rateBps).toBe(400);
  });

  it("Case 2: Calculation falls below minimum floor, applies minimum (Band 1)", () => {
    // 1,000,000 * 4.5% = 45,000. (Minimum is 50k).
    const result = calculateBasicPremium(1000000, mockBands);
    
    expect(result.value).toBe(50000);
    expect(result.breakdown.isMinPremiumApplied).toBe(true);
    expect(result.breakdown.rawCalculation).toBe(45000);
    expect(result.breakdown.rateBps).toBe(450);
  });

  it("Case 3: Exact boundary value - Max of Band 1", () => {
    // 1,500,000 is the exact ceiling of Band 1.
    // 1,500,000 * 4.5% = 67,500.
    const result = calculateBasicPremium(1500000, mockBands);
    
    expect(result.value).toBe(67500);
    expect(result.breakdown.rateBps).toBe(450);
  });

  it("Case 4: Exact boundary value - Min of Band 2", () => {
    // 1,500,001 is the exact floor of Band 2.
    // 1,500,001 * 4.0% = 60,000.04 -> Engine rounds to nearest shilling (60,000).
    const result = calculateBasicPremium(1500001, mockBands);
    
    expect(result.value).toBe(60000);
    expect(result.breakdown.rateBps).toBe(400);
  });

  it("Case 5: High-value vehicle in Band 3", () => {
    // 8,000,000 * 3.5% = 280,000.
    const result = calculateBasicPremium(8000000, mockBands);
    
    expect(result.value).toBe(280000);
    expect(result.breakdown.isMinPremiumApplied).toBe(false);
    expect(result.breakdown.rateBps).toBe(350);
  });

  it("Case 6: Throws an error if vehicle value is out of all bands", () => {
    // 15,000,000 is completely out of bounds for our mock setup.
    // Testing errors requires wrapping the function call in a callback so Jest can catch it.
    expect(() => {
      calculateBasicPremium(15000000, mockBands);
    }).toThrow("Vehicle value out of range for basic premium");
  });
});