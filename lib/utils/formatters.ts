import { QuoteBreakdown } from "@/types";

export function formatWhatsAppQuote(
  vehicleValue: number | "",
  coverType: string,
  quoteBreakdown: QuoteBreakdown
): string {
  if (vehicleValue === "") return "";

  const ridersTotal = quoteBreakdown.calculatedRiders.reduce(
    (sum, r) => sum + r.premium,
    0
  );
  const leviesTotal = quoteBreakdown.itl + quoteBreakdown.phcf + quoteBreakdown.stampDuty;

  return `
*Motor Insurance Quote*
Vehicle Value: KES ${vehicleValue.toLocaleString("en-KE")}
Cover Type: ${coverType}

*Premium Breakdown:*
- Basic Premium: KES ${quoteBreakdown.basicPremium.toLocaleString("en-KE")}
- Optional Riders: KES ${ridersTotal.toLocaleString("en-KE")}
- Levies & Taxes: KES ${leviesTotal.toLocaleString("en-KE")}

*Total Payable: KES ${quoteBreakdown.totalPayable.toLocaleString("en-KE")}*
  `.trim();
}