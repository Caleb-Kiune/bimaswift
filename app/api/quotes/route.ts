import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
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
      },
    });

    revalidatePath("/dashboard")
    return Response.json({ success: true, quote: savedQuote }, { status: 201 });
  } catch (error) {
    console.error("Error saving quote to database:", error);
    return Response.json(
      { success: false, error: "Failed to save quote" },
      { status: 500 },
    );
  }
}
