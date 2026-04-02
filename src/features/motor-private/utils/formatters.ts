import { DetailedQuoteBreakdown } from "@/src/features/motor-private/types";
import { formatKES } from "@/src/lib/formatters";

export function formatWhatsAppQuote(
  insurerName: string,
  vehicleValue: number | "",
  coverType: string,
  quoteBreakdown: DetailedQuoteBreakdown,
): string {
  if (vehicleValue === "") return "";

  let ridersText = "";
  if (quoteBreakdown.calculatedRiders.length > 0) {
    ridersText =
      "\n*Optional Riders:*\n" +
      quoteBreakdown.calculatedRiders
        .map(
          (rider) =>
            `+ ${rider.name}: ${rider.premium.value === 0 ? "Included (Free)" : formatKES(rider.premium.value)}`,
        )
        .join("\n");
  }

  return `
*Motor Insurance Quote - ${insurerName}*
Vehicle Value: ${formatKES(vehicleValue)}
Cover Type: ${coverType}

*Core Premium:*
- Basic Premium: ${formatKES(quoteBreakdown.basicPremium)}${ridersText}

*Levies & Taxes:*
- Training Levy (ITL): ${formatKES(quoteBreakdown.itl)}
- Policyholders Fund (PHCF): ${formatKES(quoteBreakdown.phcf)}
- Stamp Duty: ${formatKES(quoteBreakdown.stampDuty)}

*Total Payable: ${formatKES(quoteBreakdown.totalPayable)}*
  `.trim();
}

