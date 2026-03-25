"use client";

import { useState } from "react";
import { CommercialQuoteResult } from "../../features/motor-commercial/types";
import CommercialQuoteForm from "../../features/motor-commercial/components/CommercialQuoteForm";
import CommercialComparisonTable from "../../features/motor-commercial/components/CommercialComparisonTable";

export default function CommercialPage() {
  const [quoteResults, setQuoteResults] = useState<
    CommercialQuoteResult[] | null
  >(null);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Commercial Quote
      </h1>
      <CommercialQuoteForm setQuoteResults={setQuoteResults} />
      <CommercialComparisonTable quoteResults={quoteResults} />
    </div>
  );
}
