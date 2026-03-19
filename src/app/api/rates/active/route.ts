import { NextResponse } from "next/server";
import { activeProducts } from "@/src/features/motor/data/insurers";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json(activeProducts);
}
