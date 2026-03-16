import { UserButton } from "@clerk/nextjs";
import QuoteForm from "@/components/QuoteForm";
import { prisma } from "@/lib/prisma";
import { Quote } from "@prisma/client";

export default async function Dashboard() {
  let fetchedQuotes: Quote[] = [];

  try {
    fetchedQuotes = await prisma.quote.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3
    });
  } catch (error) {
    console.error("Error getting saved quotes", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Quoting Engine Dashboard
          </h1>
          <UserButton />
        </div>

        <QuoteForm />

        <div className="mt-12 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Recent Quotes
          </h2>

          {fetchedQuotes.length === 0 ? (
            <p className="text-sm text-gray-500">No quotes saved yet.</p>
          ) : (
            <div className="space-y-3">
              {fetchedQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-blue-900">
                      {quote.insurerId}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      KES {quote.vehicleValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quote.coverType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
