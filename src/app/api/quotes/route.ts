import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
      selectedRiderIds,
    } = await req.json();

    const savedQuote = await prisma.quote.create({
      data: {
        idempotencyKey,
        vehicleValue,
        yom,
        coverType,
        insurerId,
        selectedRiderIds,
        userId,
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
