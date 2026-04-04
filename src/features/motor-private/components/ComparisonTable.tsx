"use client";

import { useState, useRef, useEffect } from "react";
import {
  DetailedQuoteBreakdown,
  InsuranceProduct,
} from "@/src/features/motor-private/types";
import { Show, SignInButton } from "@clerk/nextjs";
import { formatKES } from "@/src/lib/formatters";
import DownloadPrivateQuoteWrapper from "./DownloadPrivateQuoteWrapper";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

interface ComparisonQuote {
  insurerId: string;
  insurerName: string;
  quote: DetailedQuoteBreakdown;
  riderIds: string[];
}

interface Props {
  comparisonQuotes: ComparisonQuote[] | null;
  isSubmitting: boolean;

  handleSaveQuote: (insurerId: string) => void;
  products: InsuranceProduct[] | null;
  insurerUpgrades: Record<string, Record<string, string | boolean>>;
  handleInsurerRiderToggle: (insurerId: string, type: string) => void;
  handleInsurerRiderOptionChange: (
    insurerId: string,
    type: string,
    optionId: string,
  ) => void;
  displayedCoverType: "COMPREHENSIVE" | "TPO";
  recalculatingInsurers: Record<string, boolean>;
}

import PrivateQuoteCard from "./PrivateQuoteCard";

export default function QuoteMarketplace({
  comparisonQuotes,
  isSubmitting,

  handleSaveQuote,
  products,
  insurerUpgrades,
  handleInsurerRiderToggle,
  handleInsurerRiderOptionChange,
  displayedCoverType,
  recalculatingInsurers,
}: Props) {
  // The quotes are already stably sorted by the Orchestrator Hook
  const sortedQuotes = comparisonQuotes || [];

  // Empty state handling
  if (sortedQuotes.length === 0) {
    return (
      <EmptyState 
        className="mt-8"
        title="No quotes available" 
        description="Please adjust your parameters to generate new quotes."
      />
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
        <h3 className="font-semibold text-zinc-900">Available Quotes</h3>
        <span className="text-xs font-medium text-zinc-500">
          Sorted by Lowest Price
        </span>
      </div>

      <div className="space-y-4">
        {sortedQuotes.map((comp) => {
          const product = products?.find((p) => p.insurerId === comp.insurerId);
          const isRecalculating = recalculatingInsurers[comp.insurerId];

          return (
            <PrivateQuoteCard
              key={comp.insurerId}
              insurerId={comp.insurerId}
              insurerName={comp.insurerName}
              quote={comp.quote}
              isHistoryView={false}
              isSubmitting={isSubmitting}
              handleSaveQuote={handleSaveQuote}
              product={product}
              insurerUpgrades={insurerUpgrades[comp.insurerId]}
              handleInsurerRiderToggle={handleInsurerRiderToggle}
              handleInsurerRiderOptionChange={handleInsurerRiderOptionChange}
              displayedCoverType={displayedCoverType}
              isRecalculating={isRecalculating}
            />
          );
        })}
      </div>
    </div>
  );
}
