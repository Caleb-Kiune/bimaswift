import { NextResponse } from "next/server";
import { commercialQuoteSchema } from "../../../../features/motor-commercial/validations/commercialValidation";
import calculatePremium from "../../../../features/motor-commercial/engine/calculator";
import { activeCommercialProducts } from "../../../../features/motor-commercial/data/rates";

export async function POST(req: Request) {
  try {
    

    // 1. Extract the raw JSON body
    const body = await req.json();

    // 2. The Bouncer: Validate the raw data
    const validationResult = commercialQuoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // 3. The Engine: Calculate quotes
    const validData = validationResult.data;
    const quotes = calculatePremium(activeCommercialProducts, validData);

    // 4. Send the quotes back to the frontend
    return NextResponse.json({ quotes }, { status: 200 });

  } catch (error) {
    console.error("Pricing Engine Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while calculating premium" },
      { status: 500 }
    );
  }
}