import { ExplainedValue } from "@/src/features/motor-private/types";

export function formatKES(amount: number | ExplainedValue<unknown>): string {
  const valueToFormat = typeof amount === "number" ? amount : amount.value;

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(valueToFormat);
}
