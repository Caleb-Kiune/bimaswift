import { NextResponse } from "next/server";
import calculateMotorPremium from "@/lib/engine";

interface Rates {
      basicRateBps: number
      basicMinPremium: number
      pvtRateBps: number
      pvtMinPremium: number
      tpoFlatPremium: number
    }


    //sample rates for testing
const sampleRates: Rates =  {
      basicRateBps: 450,
      basicMinPremium: 20000,
      pvtRateBps: 25,
      pvtMinPremium: 3000,
      tpoFlatPremium: 7500,
    }

const mockDb: any[] = [];

export async function POST(request: Request) {
  const body = await request.json();

  //check for existing quotes in the db
  const existingQuote = mockDb.find((item) => item.idempotencykey === body.idempotencykey);

  if (existingQuote) {
    return NextResponse.json(existingQuote);
  } 

  const newQuote = {
    idempotencyKey: body.idempotencykey,
    quote:calculateMotorPremium(body.vehicleValue, body.coverType, sampleRates)
}

  mockDb.push(newQuote)

  return NextResponse.json(newQuote, {status: 201});
}
