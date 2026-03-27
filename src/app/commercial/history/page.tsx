import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import DownloadQuoteWrapper from "@/src/features/motor-commercial/components/DownloadQuoteWrapper";
import { 
  CalculationBreakdown, 
  RiderBreakdown, 
  LevyBreakdown, 
  CommercialQuoteResult 
} from "@/src/features/motor-commercial/types";

export default async function CommercialHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="p-6">Please log in to view your quote history.</div>;
  }

  const quotes = await prisma.motorCommercialQuote.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });

  const formatRate = (bps: number) => `${(bps / 100).toFixed(2)}%`;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quote History</h1>
            <p className="text-sm text-gray-500">Review and manage your previous commercial quotes</p>
          </div>
          <Link
            href="/commercial"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
          >
            + New Quote
          </Link>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">You haven&apos;t generated any commercial quotes yet.</p>
          </div>
        ) : (
          /* Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map((quote) => {
              // HYDRATION: Reconstruct the math story from JSON columns
              const mappedQuote: CommercialQuoteResult = {
                insurerId: quote.insurerId,
                insurerName: quote.insurerName,
                sumInsured: quote.sumInsured ?? undefined,
                basicPremium: quote.basicPremium,
                pllCharge: quote.pllCharge,
                riderPremiums: quote.riderPremiums,
                totalLevies: quote.levies,
                stampDuty: quote.stampDuty,
                totalPremium: quote.totalPremium,
                basePremiumDetails: quote.basePremiumDetails as unknown as CalculationBreakdown,
                riderDetails: quote.riderDetails as unknown as RiderBreakdown[],
                levyDetails: quote.levyDetails as unknown as LevyBreakdown,
                floorOverrodeDiscount: quote.floorOverrodeDiscount,
                fleetDiscountApplied: quote.fleetDiscountApplied,
              };

              return (
                <div 
                  key={quote.id} 
                  className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex flex-col space-y-4 hover:shadow-md transition-shadow"
                >
                  {/* Card Header: Insurer & Date */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-blue-900 text-lg">{quote.insurerName}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                        {new Date(quote.createdAt).toLocaleDateString('en-KE', { dateStyle: 'long' })}
                      </p>
                    </div>
                    {quote.fleetDiscountApplied && (
                      <span className="bg-green-100 text-green-700 text-[9px] px-2 py-1 rounded-full font-bold uppercase">
                        Fleet
                      </span>
                    )}
                  </div>

                  {/* Asset Information */}
                  <div className="flex gap-3 text-xs">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                      {quote.coverType}
                    </span>
                    <span className="text-gray-500 py-1">
                      {quote.sumInsured 
                        ? `Value: KES ${quote.sumInsured.toLocaleString()}` 
                        : `Tonnage: ${quote.tonnage} Tons`}
                    </span>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Math Breakdown Context */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Basic Premium</span>
                      <span className="font-semibold text-gray-900">KES {quote.basicPremium.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-gray-400">
                        Rate: {formatRate(mappedQuote.basePremiumDetails.rateValue)}
                      </span>
                      {quote.floorOverrodeDiscount && (
                        <span className="text-[10px] text-amber-600 font-medium">⚠️ Min. Applied</span>
                      )}
                    </div>
                  </div>

                  {/* Riders (Benefits) */}
                  {mappedQuote.riderDetails.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      {mappedQuote.riderDetails.map((rider) => (
                        <div key={rider.riderId} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{rider.name}</span>
                          <span className="font-medium text-gray-700">
                            {rider.premium > 0 ? `KES ${rider.premium.toLocaleString()}` : "FREE"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary & Download */}
                  <div className="pt-2 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-sm font-medium text-gray-500">Total Payable</span>
                      <span className="text-lg font-bold text-blue-600">
                        KES {quote.totalPremium.toLocaleString()}
                      </span>
                    </div>
                    <DownloadQuoteWrapper quote={mappedQuote} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}