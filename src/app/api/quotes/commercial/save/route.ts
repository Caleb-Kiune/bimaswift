import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../../lib/prisma";
import calculatePremium from "../../../../../features/motor-commercial/engine/calculator";
import { activeCommercialProducts } from "../../../../../features/motor-commercial/data/rates";


export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract payload
    const body = await req.json();
    const { request: quoteRequest, quote: clientQuote } = body;

    if (!quoteRequest || !clientQuote) {
      return NextResponse.json(
        { error: "Missing quote data" },
        { status: 400 },
      );
    }

    // 3. ZERO TRUST: Recalculate the premium on the server
    const serverGeneratedQuotes = calculatePremium(
      activeCommercialProducts,
      quoteRequest,
    );

    // Find the specific quote the user clicked "Save" on
    const verifiedQuote = serverGeneratedQuotes.find(
      (q) => q.insurerId === clientQuote.insurerId,
    );

    if (!verifiedQuote) {
      return NextResponse.json(
        { error: "Invalid quote parameters" },
        { status: 400 },
      );
    }

   

    // 4. Persistence using create()
    const savedQuote = await prisma.motorCommercialQuote.create({
      data: {
        // User Info
        userId: userId,
        insurerId: verifiedQuote.insurerId,
        insurerName: verifiedQuote.insurerName,
        // Quote Request
        coverType: quoteRequest.coverType,
        usageType: quoteRequest.usageType,
        tonnage: quoteRequest.tonnage,
        sumInsured: quoteRequest.sumInsured,
        isFleet: quoteRequest.isFleet,
        includePLL: quoteRequest.includePLL,
        passengerCount: quoteRequest.passengerCount,
        selectedRiders: quoteRequest.selectedRiders,
        // Quote Results
        basicPremium: verifiedQuote.basicPremium,
        pllCharge: verifiedQuote.pllCharge,
        riderPremiums: verifiedQuote.riderPremiums,
        levies: verifiedQuote.totalLevies,
        stampDuty: verifiedQuote.stampDuty,
        totalPremium: verifiedQuote.totalPremium,

        // Breakdown
        basePremiumDetails: verifiedQuote.basePremiumDetails as any,
        riderDetails: verifiedQuote.riderDetails as any,
        levyDetails: verifiedQuote.levyDetails as any,

        // Flags
        floorOverrodeDiscount: verifiedQuote.floorOverrodeDiscount,
        fleetDiscountApplied: verifiedQuote.fleetDiscountApplied,
      },
    });

    return NextResponse.json({ success: true, savedQuote }, { status: 200 });
  } catch (error) {
    console.error("Save Quote Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
