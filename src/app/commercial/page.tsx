"use client";

import { useState } from "react";
import {
  CommercialQuoteResult,
  CommercialVehicleRequest,
} from "../../features/motor-commercial/types";
import CommercialQuoteForm from "../../features/motor-commercial/components/CommercialQuoteForm";
import CommercialComparisonTable from "../../features/motor-commercial/components/CommercialComparisonTable";
import Link from "next/link";

export default function CommercialPage() {
  const [quoteResults, setQuoteResults] = useState<
    CommercialQuoteResult[] | null
  >(null);

  const [quoteRequest, setQuoteRequest] =
    useState<CommercialVehicleRequest | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Commercial Quote</h1>

          <Link
            href="/commercial/history"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition duration-200"
          >
            View Quote History
          </Link>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <CommercialQuoteForm
            setQuoteResults={setQuoteResults}
            setQuoteRequest={setQuoteRequest}
          />
        </div>

        {/* Results Section */}
        {quoteResults && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quote Results
            </h2>
            <CommercialComparisonTable
              quoteResults={quoteResults}
              quoteRequest={quoteRequest}
            />
          </div>
        )}
      </div>
    </div>
  );
}
