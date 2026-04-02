"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CommercialQuoteResult,
  CommercialVehicleRequest,
} from "@/src/features/motor-commercial/types";
import CommercialQuoteForm from "@/src/features/motor-commercial/components/CommercialQuoteForm";
import CommercialComparisonTable from "@/src/features/motor-commercial/components/CommercialComparisonTable";
import { buttonVariants } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export default function CommercialPage() {
  const [quoteResults, setQuoteResults] = useState<CommercialQuoteResult[] | null>(null);
  const [quoteRequest, setQuoteRequest] = useState<CommercialVehicleRequest | null>(null);

  return (
    <main className="min-h-screen bg-secondary/30 py-12 px-4 sm:px-8">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        {/* Header / Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          
          <Link href="/quote/motor-commercial/history" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl shrink-0")}>
             View Quote History
          </Link>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Commercial Motor Quote
          </h1>
          <p className="text-muted-foreground">
            Access the enterprise module for heavy commercial vehicles, cartage, and fleet policies.
          </p>
        </div>

        {/* The Form */}
        <CommercialQuoteForm
          setQuoteResults={setQuoteResults}
          setQuoteRequest={setQuoteRequest}
        />

        {/* Results */}
        {quoteResults && (
          <CommercialComparisonTable
            quoteResults={quoteResults}
            quoteRequest={quoteRequest}
          />
        )}
      </div>
    </main>
  );
}
