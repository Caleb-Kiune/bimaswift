"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";

import { CommercialQuoteResult, CommercialVehicleRequest } from "../types";
import DownloadQuoteWrapper from "./DownloadQuoteWrapper";
import CommercialQuoteCard from "./CommercialQuoteCard";

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

      <div className="space-y-4">
        {quoteResults.map((quote) => {
          const isSaving = savingQuotesIds.includes(quote.insurerId);
          const isSaved = savedQuotesIds.includes(quote.insurerId);

          return (
            <CommercialQuoteCard
              key={quote.insurerId}
              quote={quote}
              onSaveQuote={handleSaveQuote}
              isSaving={isSaving}
              isSaved={isSaved}
            />
          );
        })}
      </div>
    </div>
  );
}
