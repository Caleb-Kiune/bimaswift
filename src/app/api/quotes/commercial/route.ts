import { NextResponse } from "next/server";
import { commercialQuoteSchema } from "../../../../features/motor-commercial/validations/commercialValidation";
import calculatePremium from "../../../../features/motor-commercial/engine/calculator";
import { activeCommercialProducts } from "../../../../features/motor-commercial/data/rates";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validationResult = commercialQuoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 },
      );
    }

    const validData = validationResult.data;
    const quotes = calculatePremium(activeCommercialProducts, validData);

    return NextResponse.json({ quotes }, { status: 200 });
  } catch (error) {
    console.error("Pricing Engine Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while calculating premium" },
      { status: 500 },
    );
  }
}
