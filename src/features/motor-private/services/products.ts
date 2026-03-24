import { activeProducts } from "@/src/features/motor-private/data/insurers";
import { InsuranceProduct } from "@/src/features/motor-private/types";

export async function getActiveMotorProducts(): Promise<InsuranceProduct[]> {
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  return activeProducts;
}
