export interface MotorPremiumRates {
  basicRateBps: number
  basicMinPremium: number
  pvtRateBps: number
  pvtMinPremium: number
  tpoFlatPremium: number
}

export const activeRates: MotorPremiumRates = {
  basicRateBps: 450,
  basicMinPremium: 20000,
  pvtRateBps: 25,
  pvtMinPremium: 3000,
  tpoFlatPremium: 7500,
}