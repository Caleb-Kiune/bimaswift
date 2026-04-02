import { NextResponse } from "next/server";
import { privateQuoteSchema } from "../../../../features/motor-private/validations/privateValidation";
import calculatePremium from "../../../../features/motor-private/engine/calculator";
import { activeProducts as activePrivateProducts } from "@/src/features/motor-private/data/insurers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validationResult = privateQuoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { requestMode, vehicleValue, coverType, selectedRiders, targetInsurerId } = validationResult.data;

    if (requestMode === "UPDATE_SINGLE" && !targetInsurerId) {
      return NextResponse.json(
        { error: "targetInsurerId is required for UPDATE_SINGLE mode" },
        { status: 400 }
      );
    }

    const productsToProcess = requestMode === "UPDATE_SINGLE"
      ? activePrivateProducts.filter((p) => p.insurerId === targetInsurerId)
      : activePrivateProducts;

    if (productsToProcess.length === 0) {
      return NextResponse.json(
        { error: "No matching insurers found" },
        { status: 404 }
      );
    }

    // Calculate quotes for relevant underwriter products
    const quotes = productsToProcess.map((product) => {
      const quoteBreakdown = calculatePremium(
        vehicleValue,
        coverType,
        product,
        selectedRiders
      );

      return {
        insurerId: product.insurerId,
        insurerName: product.insurerName,
        quote: quoteBreakdown,
        riderIds: quoteBreakdown.calculatedRiders.map((r) => r.id),
      };
    });

    return NextResponse.json({ quotes }, { status: 200 });
  } catch (error) {
    console.error("Private Pricing Engine Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while calculating premium" },
      { status: 500 }
    );
  }
}
