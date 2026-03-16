import { prisma } from "@/lib/prisma";

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
    return Response.json({ success: true, quote: savedQuote }, { status: 201 });
  } catch (error) {
    console.error("Error saving quote to database:", error);
    return Response.json(
      { success: false, error: "Failed to save quote" },
      { status: 500 },
    );
  }
}
