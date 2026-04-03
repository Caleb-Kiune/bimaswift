"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";

import { CommercialQuoteResult, CommercialVehicleRequest } from "../types";
import DownloadQuoteWrapper from "./DownloadQuoteWrapper";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/src/components/ui/accordion";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

interface CommercialComparisonTableProps {
  quoteResults: CommercialQuoteResult[] | null;
  quoteRequest: CommercialVehicleRequest | null;
}

export default function CommercialComparisonTable({
  quoteResults,
  quoteRequest,
}: CommercialComparisonTableProps) {
  const { isSignedIn } = useAuth();
  const [savedQuotesIds, setSavedQuotesIds] = useState<string[]>([]);
  const [savingQuotesIds, setSavingQuotesIds] = useState<string[]>([]);

  const formatRate = (bps: number) => `${(bps / 100).toFixed(2)}%`;
  const formatUsageType = (type: string) => type === "OWN_GOODS" ? "Own Goods" : "General Cartage";
  const formatCoverType = (type: string) => type === "COMPREHENSIVE" ? "Comprehensive" : "Third Party Only";

  const handleSaveQuote = async (selectedQuote: CommercialQuoteResult) => {
    if (!quoteRequest) return;

    try {
      setSavingQuotesIds((prev) => [...prev, selectedQuote.insurerId]);

      const response = await fetch("/api/quotes/commercial/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: quoteRequest, quote: selectedQuote }),
      });

      if (!response.ok) throw new Error("Failed to save quote");

      setSavingQuotesIds((prev) => prev.filter((id) => id !== selectedQuote.insurerId));
      setSavedQuotesIds((prev) => [...prev, selectedQuote.insurerId]);
    } catch (error) {
      setSavingQuotesIds((prev) => prev.filter((id) => id !== selectedQuote.insurerId));
      console.error("Failed to save quote:", error);
    }
  };

  if (!quoteResults) return null;

  if (quoteResults.length === 0) {
    return (
      <EmptyState 
        className="mt-8"
        title="No quotes available" 
        description="Please adjust your parameters to generate new commercial quotes."
      />
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="font-semibold text-foreground">Available Commercial Quotes</h3>
      </div>

      <Accordion className="space-y-4">
        {quoteResults.map((quote) => {
          const isSaving = savingQuotesIds.includes(quote.insurerId);
          const isSaved = savedQuotesIds.includes(quote.insurerId);

          return (
            <AccordionItem
              key={quote.insurerId}
              value={quote.insurerId}
              className="border-none"
            >
              <Card className="rounded-2xl transition-all shadow-sm hover:border-border overflow-hidden bg-card">
                <AccordionTrigger className="w-full text-left px-5 py-5 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <div className="flex flex-col sm:flex-row justify-between w-full pr-4 items-start sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex h-12 w-12 rounded-full bg-secondary items-center justify-center text-muted-foreground font-bold text-lg border border-border shrink-0">
                        {quote.insurerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-lg leading-tight text-foreground">
                            {quote.insurerName}
                          </h4>
                          {quote.fleetDiscountApplied && (
                            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
                              Fleet Rate
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatCoverType(quote.coverType)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            &bull; {formatUsageType(quote.usageType)}
                          </span>
                        </div>
                        {quote.sumInsured && (
                          <span className="text-xs text-muted-foreground mt-1 block">
                            Sum Insured: KES {quote.sumInsured.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex flex-col items-start sm:items-end">
                      <span className="font-extrabold text-2xl tracking-tight text-foreground">
                        KES {quote.totalPremium.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-primary mt-1">
                        View Breakdown
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-5 pb-5">
                  <div className="border-t border-dashed border-border pt-4 text-sm mt-2">
                    {/* Basic Premium */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Basic Premium</span>
                        <span className="font-semibold text-foreground">
                          KES {quote.basicPremium.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {quote.basePremiumDetails.rateType === "FLAT" ? "Flat Rate" : `Rate: ${formatRate(quote.basePremiumDetails.rateValue)}`}
                        </span>
                        {quote.basePremiumDetails.minimumApplied && (
                          <span className="text-[10px] text-amber-600 font-medium">
                            ⚠️ Underwriter Minimum Enforced
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 🚨 NEW: Add the PLL Breakdown Here 🚨 */}
                    {quote.pllCharge > 0 && quote.pllDetails && (
                      <div className="mb-3 border-t border-dashed border-border pt-3">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Passenger Legal Liability</span>
                          <span className="font-semibold text-foreground">
                            KES {quote.pllCharge.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            Rate: KES {quote.pllDetails.ratePerPassenger.toLocaleString()} per passenger x {quote.pllDetails.passengerCount} passengers
                          </span>
                        </div>
                      </div>
                    )}
                    {/* -------------------------------------- */}

                    {/* Riders */}
                    {quote.riderDetails.length > 0 && (
                      <div className="bg-secondary/50 p-3 rounded-md space-y-2 mb-4">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Included Benefits
                        </p>
                        {quote.riderDetails.map((rider) => (
                          <div key={rider.riderId} className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-foreground flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                {rider.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground ml-5 mt-0.5">
                                {rider.rateType === "FREE" && "Complimentary"}
                                {rider.rateType === "FLAT" && "Flat Rate"}
                                {rider.rateType === "PERCENTAGE_BPS" && `Rate: ${formatRate(rider.rateValue)}`}
                                {rider.minimumApplied && " (Min. Applied)"}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-foreground">
                              {rider.premium > 0 ? `KES ${rider.premium.toLocaleString()}` : <span className="text-emerald-600 font-semibold text-xs uppercase">Free</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Levies */}
                    <div className="text-sm border-t border-dashed border-border pt-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Training Levy ({formatRate(quote.levyDetails.trainingLevy.rateValueBps)})</span>
                        <span>{quote.levyDetails.trainingLevy.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Policyholders Fund ({formatRate(quote.levyDetails.policyholdersFund.rateValueBps)})</span>
                        <span>{quote.levyDetails.policyholdersFund.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Stamp Duty</span>
                        <span>{quote.levyDetails.stampDuty.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-3 mt-3 border-t border-border">
                      <p className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-foreground">Total Premium</span>
                        <span className="text-lg font-bold text-primary">
                          KES {quote.totalPremium.toLocaleString()}
                        </span>
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-4 mt-4 space-y-3">
                      <DownloadQuoteWrapper quote={quote} />

                      {isSignedIn ? (
                        <Button
                          variant="ghost"
                          className="w-full rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground"
                          disabled={isSaving || isSaved}
                          onClick={() => handleSaveQuote(quote)}
                        >
                          {isSaving && <Spinner size="sm" className="mr-2" />}
                          {isSaved ? "Saved to Dashboard" : isSaving ? "Saving..." : "Save to Dashboard"}
                        </Button>
                      ) : (
                        <SignInButton mode="modal" fallbackRedirectUrl="/">
                          <Button variant="ghost" className="w-full rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground">
                            Sign in to save this quote
                          </Button>
                        </SignInButton>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
