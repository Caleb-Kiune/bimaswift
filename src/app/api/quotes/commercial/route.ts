import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // Clerk Auth for server-side
import { prisma } from "../../../../lib/prisma"; // Your enterprise database connection!
import { commercialQuoteSchema } from "../../../../features/motor-commercial/validations/commercialValidation";
import calculatePremium from "../../../../features/motor-commercial/engine/calculator";
import { activeCommercialProducts } from "../../../../features/motor-commercial/data/rates";

export async function POST(req: Request) {
  try {
    
    const { userId } = await auth();

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

    // 4. The Memory Layer: Save to PostgreSQL
    // We only save if there is a logged-in user and the engine actually generated quotes.
    if (userId && quotes.length > 0) {
      
      // We map the generated quotes into the exact shape our Prisma schema expects
      const quotesToSave = quotes.map((quote) => ({
        userId: userId,
        insurerId: quote.insurerId,
        insurerName: quote.insurerName,
        coverType: validData.coverType,
        usageType: validData.usageType,
        tonnage: validData.tonnage,
        sumInsured: quote.sumInsured ?? null, 
        isFleet: validData.isFleet,
        includePLL: validData.includePLL,
        passengerCount: validData.passengerCount ?? null,
        selectedRiders: validData.selectedRiders ?? [],

        // Premium Totals
        basicPremium: quote.basicPremium,
        pllCharge: quote.pllCharge,
        riderPremiums: quote.riderPremiums,
        levies: quote.totalLevies,
        stampDuty: quote.stampDuty,
        totalPremium: quote.totalPremium,

        // Transparency Details (The "Math Story")
        basePremiumDetails: quote.basePremiumDetails as any,
        riderDetails: quote.riderDetails as any,
        levyDetails: quote.levyDetails as any,
        
        // UX Flags
        floorOverrodeDiscount: quote.floorOverrodeDiscount,
        fleetDiscountApplied: quote.fleetDiscountApplied,
      }));

      // Bulk Insert: createMany is highly optimized for saving arrays of data!
      await prisma.motorCommercialQuote.createMany({
        data: quotesToSave,
      });

      console.log(`Successfully saved ${quotesToSave.length} quotes to the database!`);
    }

    // 5. Send the quotes back to the frontend
    return NextResponse.json({ quotes }, { status: 200 });

  } catch (error) {
    console.error("Pricing Engine Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while calculating premium" },
      { status: 500 }
    );
  }
}