"use client";

import { CommercialQuoteResult } from "../types";
import DownloadQuoteWrapper from "./DownloadQuoteWrapper";

interface CommercialComparisonTableProps {
  quoteResults: CommercialQuoteResult[] | null;
}

export default function CommercialComparisonTable({
  quoteResults,
}: CommercialComparisonTableProps) {
  return (
    <>
      {quoteResults && (
        <div className="mt-8 max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Quote Results
          </h2>
          {quoteResults.map((quote) => (
            <div
              key={quote.insurerId}
              className="border border-gray-200 rounded p-4 bg-white shadow-sm flex flex-col"
            >
              <h3 className="font-medium text-gray-700">{quote.insurerName}</h3>
              <p>
                Basic Premium:{" "}
                <span className="font-semibold">
                  KES {quote.basicPremium.toLocaleString()}
                </span>
              </p>

              {/* Riders */}
              {quote.riderPremiums > 0 && (
                <p>
                  Rider Premiums:{" "}
                  <span className="font-semibold">
                    KES {quote.riderPremiums.toLocaleString()}
                  </span>
                </p>
              )}

              <p>
                Levies:{" "}
                <span className="font-semibold">
                  KES {quote.levies.toLocaleString()}
                </span>
              </p>

              <p className="mb-4 text-lg">
                Total Premium:{" "}
                <span className="font-bold text-blue-600">
                  KES {quote.totalPremium.toLocaleString()}
                </span>
              </p>

              {/* 2. The PDF Download Trigger */}
              <div className="mt-4 text-center">
                <DownloadQuoteWrapper quote={quote} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
