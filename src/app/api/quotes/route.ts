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
      vehicleValue,
      yom,
      coverType,
      insurerId,
      selectedRiders = {},
    } = await req.json();

    const product = activePrivateProducts.find((p) => p.insurerId === insurerId);
    if (!product) {
       return NextResponse.json({ error: "Insurer not found" }, { status: 404 });
    }

    // Zero-Trust: Recalculate on the server using the same Record<string, string|boolean>
    // the live quote engine uses. This guarantees the snapshot is identical.
    const quoteBreakdown = calculatePremium(
        vehicleValue,
        coverType,
        product,
        selectedRiders
    );

    const savedQuote = await prisma.savedQuote.create({
      data: {
        userId,
        insurerId,
        insurerName: product.insurerName,
        module: "MOTOR_PRIVATE",
        
        coverType,
        totalPremium: quoteBreakdown.totalPayable,
        sumInsured: vehicleValue || null,

        quoteData: quoteBreakdown as unknown as Prisma.InputJsonValue,
        requestData: {
          vehicleValue,
          yom,
          coverType,
          selectedRiders,
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

