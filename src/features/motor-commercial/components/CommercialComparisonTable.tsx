"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs"; // 1. Import Clerk's auth hook
import Link from "next/link"; // Optional: to link users to your sign-in page

import { CommercialQuoteResult, CommercialVehicleRequest } from "../types";
import DownloadQuoteWrapper from "./DownloadQuoteWrapper";

interface CommercialComparisonTableProps {
  quoteResults: CommercialQuoteResult[] | null;
  quoteRequest: CommercialVehicleRequest | null;
}

export default function CommercialComparisonTable({
  quoteResults,
  quoteRequest,
}: CommercialComparisonTableProps) {
  // 2. Extract the user's sign-in status
  const { isSignedIn } = useAuth();

  const [savedQuotesIds, setSavedQuotesIds] = useState<string[]>([]);
  const [savingQuotesIds, setSavingQuotesIds] = useState<string[]>([]);

  // Helper to format BPS to Percentage (e.g., 450 -> 4.5%)
  const formatRate = (bps: number) => `${(bps / 100).toFixed(2)}%`;

  const handleSaveQuote = async (selectedQuote: CommercialQuoteResult) => {
    if (!quoteRequest) {
      console.error("No request data available to save alongside the quote.");
      return;
    }

    try {
      setSavingQuotesIds((prev) => [...prev, selectedQuote.insurerId]);

      const response = await fetch("/api/quotes/commercial/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: quoteRequest,
          quote: selectedQuote,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save quote");
      }

      const result = await response.json();

      setSavingQuotesIds((prev) =>
        prev.filter((id) => id !== selectedQuote.insurerId),
      );
      setSavedQuotesIds((prev) => [...prev, selectedQuote.insurerId]);

      console.log("Quote saved successfully:", result);
    } catch (error) {
      setSavingQuotesIds((prev) =>
        prev.filter((id) => id !== selectedQuote.insurerId),
      );
      console.error("Failed to save quote:", error);
    }
  };

  return (
    <>
      {quoteResults && (
        <div className="mt-8 max-w-lg mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Quote Results
          </h2>
          {quoteResults.map((quote) => (
            <div
              key={quote.insurerId}
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-md flex flex-col space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-blue-900">
                  {quote.insurerName}
                </h3>
                {quote.fleetDiscountApplied && (
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                    Fleet Rate Applied
                  </span>
                )}
              </div>

              {/* Asset Value Context */}
              {quote.sumInsured && (
                <p className="text-xs text-gray-500 italic">
                  Based on Sum Insured: KES {quote.sumInsured.toLocaleString()}
                </p>
              )}

              <hr className="border-gray-100" />

              {/* Basic Premium with Math Story */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Basic Premium</span>
                  <span className="font-semibold text-gray-900">
                    KES {quote.basicPremium.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">
                    Rate: {formatRate(quote.basePremiumDetails.rateValue)}
                  </span>
                  {quote.basePremiumDetails.minimumApplied && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      ⚠️ Underwriter Minimum Enforced
                    </span>
                  )}
                </div>
              </div>

              {/* Riders Breakdown */}
              {quote.riderDetails.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Included Benefits
                  </p>
                  {quote.riderDetails.map((rider) => (
                    <div
                      key={rider.riderId}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <p className="text-xs text-gray-700">{rider.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {rider.rateType === "FREE"
                            ? "Complimentary"
                            : `Rate: ${formatRate(rider.rateValue)}`}
                          {rider.minimumApplied && " (Min. Applied)"}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {rider.premium > 0
                          ? `KES ${rider.premium.toLocaleString()}`
                          : "FREE"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Detailed Levies Breakdown */}
              <div className="text-sm border-t border-dashed pt-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Training Levy (
                    {formatRate(quote.levyDetails.trainingLevy.rateValueBps)})
                  </span>
                  <span>
                    {quote.levyDetails.trainingLevy.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Policyholders Fund (
                    {formatRate(
                      quote.levyDetails.policyholdersFund.rateValueBps,
                    )}
                    )
                  </span>
                  <span>
                    {quote.levyDetails.policyholdersFund.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Stamp Duty</span>
                  <span>
                    {quote.levyDetails.stampDuty.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="flex justify-between items-baseline">
                  <span className="text-base font-medium">Total Premium</span>
                  <span className="text-xl font-bold text-blue-600">
                    KES {quote.totalPremium.toLocaleString()}
                  </span>
                </p>
              </div>

              {/* 3. Conditional Rendering based on Auth Status */}
              {isSignedIn ? (
                <button
                  className="mt-4 w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={
                    savingQuotesIds.includes(quote.insurerId) ||
                    savedQuotesIds.includes(quote.insurerId)
                  }
                  onClick={() => handleSaveQuote(quote)}
                >
                  {savedQuotesIds.includes(quote.insurerId)
                    ? "Saved!"
                    : savingQuotesIds.includes(quote.insurerId)
                      ? "Saving..."
                      : "Save Quote"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full text-center bg-gray-100 text-gray-500 border border-gray-200 px-4 py-2 rounded-md font-medium cursor-not-allowed"
                >
                  Sign in to Save Quote
                </button>
              )}

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
