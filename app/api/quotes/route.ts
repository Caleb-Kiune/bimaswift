import { NextResponse } from "next/server";
import calculateMotorPremium from "@/lib/engine";
import { activeRates } from "@/lib/rates";

const mockDb: any[] = [];

export async function POST(request: Request) {
  const body = await request.json();

  //check for existing quotes in the db
  const existingQuote = mockDb.find(
    (item) => item.idempotencyKey === body.idempotencyKey,
  );

  if (existingQuote) {
    return NextResponse.json(existingQuote);
  }

  const newQuote = {
    idempotencyKey: body.idempotencyKey,
    quote: calculateMotorPremium(
      body.vehicleValue,
      body.coverType,
      activeRates,
    ),
  };

  mockDb.push(newQuote);

  return NextResponse.json(newQuote, { status: 201 });
}
