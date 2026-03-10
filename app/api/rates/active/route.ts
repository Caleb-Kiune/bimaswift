import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return NextResponse.json({
    rates: {
      basicRateBps: 450,
      basicMinPremium: 20000,
      pvtRateBps: 25,
      pvtMinPremium: 3000,
      tpoFlatPremium: 7500,
    },
  });
}
