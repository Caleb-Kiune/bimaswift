import React from "react";
import { QuoteBreakdown } from "@/types";

interface Props {
  comparisonQuotes: any[] | null; // You can strongly type this later if you want!
  isSubmitting: boolean;
  handleSelectQuote: (insurerId: string, quote: QuoteBreakdown, riderIds: string[]) => void;
}

export default function QuoteMarketplace({ comparisonQuotes, isSubmitting, handleSelectQuote }: Props) {
  if (!comparisonQuotes) return null;

  return (
    <div className="mt-8 space-y-4">
      <h3 className="font-semibold text-gray-800 border-b pb-2">Available Quotes</h3>
      
      {comparisonQuotes.map((comp) => (
        <div key={comp.insurerId} className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
            <span className="font-bold text-lg text-blue-900">{comp.insurerName}</span>
            <span className="font-bold text-lg text-gray-900">
              KES {comp.quote.totalPayable.toLocaleString("en-KE")}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Basic Premium:</span>
              <span>KES {comp.quote.basicPremium.toLocaleString("en-KE")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Levies & Taxes:</span>
              <span>
                KES {(comp.quote.itl + comp.quote.phcf + comp.quote.stampDuty).toLocaleString("en-KE")}
              </span>
            </div>

            <button
              onClick={() => handleSelectQuote(comp.insurerId, comp.quote, comp.riderIds)}
              disabled={isSubmitting}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 transition"
            >
              {isSubmitting ? "Saving..." : `Select ${comp.insurerName}`}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}