import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import DownloadQuoteButton from "../../../features/motor-commercial/components/DownloadQuoteButton";

export default async function CommercialHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="p-6">Please log in to view your quote history.</div>;
  }

  const quotes = await prisma.motorCommercialQuote.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" }, 
  });

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Commercial Quote History</h1>
          <Link 
            href="/commercial" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + New Quote
          </Link>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500">You haven't generated any commercial quotes yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-sm text-gray-700">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Insurer</th>
                  <th className="p-4 font-semibold">Cover</th>
                  <th className="p-4 font-semibold">Value / Tonnage</th>
                  <th className="p-4 font-semibold">Total Premium</th>
                  {/* NEW COLUMN */}
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => {
                  // Map the database record to match the PDF component's expected interface
                  const mappedQuoteForPDF = {
                    insurerId: quote.insurerId,
                    insurerName: quote.insurerName,
                    basicPremium: quote.basicPremium,
                    pllCharge: quote.pllCharge,
                    riderPremiums: quote.riderPremiums,
                    levies: quote.levies,
                    stampDuty: quote.stampDuty,
                    totalPremium: quote.totalPremium,
                    floorOverrodeDiscount: false, 
                    fleetDiscountApplied: quote.isFleet,
                  };

                  return (
                    <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {quote.insurerName}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {quote.coverType}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {quote.sumInsured ? `KES ${quote.sumInsured.toLocaleString()}` : `${quote.tonnage} Tons`}
                      </td>
                      <td className="p-4 font-bold text-blue-600">
                        KES {quote.totalPremium.toLocaleString()}
                      </td>
                      {/* THE NEW BUTTON */}
                      <td className="p-4 text-right">
                        <DownloadQuoteButton quote={mappedQuoteForPDF} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}