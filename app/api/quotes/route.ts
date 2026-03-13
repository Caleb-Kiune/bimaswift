import { NextResponse } from "next/server";
import calculateMotorPremium from "@/lib/engine";
import { activeProducts } from "@/lib/data/insurers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleValue, yom, coverType, insurerId, selectedRiderIds } = body;

    if (!vehicleValue || !yom || !coverType || !insurerId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const product = activeProducts.find((p) => p.insurerId === insurerId);
    if (!product) {
      return new NextResponse("Invalid Insurer ID", { status: 400 });
    }

    const quoteBreakdown = calculateMotorPremium(
      vehicleValue,
      coverType,
      product,
      selectedRiderIds || [],
    );

    return NextResponse.json({ quote: quoteBreakdown });
  } catch (error) {
    console.error("[QUOTES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
