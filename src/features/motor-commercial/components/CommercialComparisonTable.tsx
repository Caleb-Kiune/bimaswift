import { CommercialQuoteResult } from "../types";

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
              className="border border-gray-200 rounded p-4 bg-white shadow-sm"
            >
              <h3 className="font-medium text-gray-700">{quote.insurerName}</h3>
              <p>
                Basic Premium:{" "}
                <span className="font-semibold">{quote.basicPremium}</span>
              </p>
              <p>
                Levies: <span className="font-semibold">{quote.levies}</span>
              </p>
              <p>
                Total Premium:{" "}
                <span className="font-semibold">{quote.totalPremium}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
