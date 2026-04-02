import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import calculatePremium from "@/src/features/motor-private/engine/calculator";
import { activeProducts as activePrivateProducts } from "@/src/features/motor-private/data/insurers";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      idempotencyKey,
      vehicleValue,
      yom,
      coverType,
      insurerId,
      selectedRiderIds = [],
    } = await req.json();

    const product = activePrivateProducts.find((p) => p.insurerId === insurerId);
    if (!product) {
       return NextResponse.json({ error: "Insurer not found" }, { status: 404 });
    }

    // Zero-Trust: Recalculate on the server. The engine intrinsically defends against tampered 
    // string IDs by verifying them strictly against the underwriter's product.riders matrix.
    const quoteBreakdown = calculatePremium(
        vehicleValue,
        coverType,
        product,
        selectedRiderIds
    );

    const savedQuote = await prisma.motorPrivateQuote.create({
      data: {
        idempotencyKey,
        userId,
        insurerId,
        insurerName: product.insurerName,
        vehicleValue,
        yom: parseInt(yom, 10),
        coverType,
        selectedRiderIds,
        
        basicPremium: quoteBreakdown.basicPremium.value,
        grossPremium: quoteBreakdown.grossPremium.value,
        itl: quoteBreakdown.itl.value,
        phcf: quoteBreakdown.phcf.value,
        stampDuty: quoteBreakdown.stampDuty.value,
        totalPayable: quoteBreakdown.totalPayable,

        basicPremiumDetails: quoteBreakdown.basicPremium.breakdown as unknown as Prisma.InputJsonValue,
        calculatedRiders: quoteBreakdown.calculatedRiders as unknown as Prisma.InputJsonValue,
        levyDetails: {
          itl: quoteBreakdown.itl.breakdown,
          phcf: quoteBreakdown.phcf.breakdown,
          stampDuty: quoteBreakdown.stampDuty.breakdown,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard");
    return NextResponse.json(
      { success: true, quote: savedQuote },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving quote to database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save quote" },
      { status: 500 },
    );
  }
}
