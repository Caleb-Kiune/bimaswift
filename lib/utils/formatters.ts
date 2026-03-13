import { QuoteBreakdown } from "@/types";

export function formatWhatsAppQuote(
  insurerName: string,
  vehicleValue: number | "",
  coverType: string,
  quoteBreakdown: QuoteBreakdown,
): string {
  if (vehicleValue === "") return "";

  let ridersText = "";
  if (quoteBreakdown.calculatedRiders.length > 0) {
    ridersText =
      "\n*Optional Riders:*\n" +
      quoteBreakdown.calculatedRiders
        .map(
          (rider) =>
            `+ ${rider.name}: ${rider.premium === 0 ? "Included (Free)" : "KES " + rider.premium.toLocaleString("en-KE")}`,
        )
        .join("\n");
  }

  return `
*Motor Insurance Quote - ${insurerName}*
Vehicle Value: KES ${vehicleValue.toLocaleString("en-KE")}
Cover Type: ${coverType}

*Core Premium:*
- Basic Premium: KES ${quoteBreakdown.basicPremium.toLocaleString("en-KE")}${ridersText}

*Levies & Taxes:*
- Training Levy (ITL): KES ${quoteBreakdown.itl.toLocaleString("en-KE")}
- Policyholders Fund (PHCF): KES ${quoteBreakdown.phcf.toLocaleString("en-KE")}
- Stamp Duty: KES ${quoteBreakdown.stampDuty.toLocaleString("en-KE")}

*Total Payable: KES ${quoteBreakdown.totalPayable.toLocaleString("en-KE")}*
  `.trim();
}
