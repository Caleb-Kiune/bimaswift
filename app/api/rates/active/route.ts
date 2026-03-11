import { NextResponse } from "next/server";
import { activeRates } from "@/lib/rates";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json(activeRates);
}
